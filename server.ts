import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { connectMongo, withoutMongoId } from "./mongo";
import { seedDatabase } from "./seed";

async function startServer(): Promise<void> {
  const { client, collections } = await connectMongo();
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  const seeded = await seedDatabase(collections);
  if (seeded.patients > 0) {
    console.log(`Seeded ${seeded.patients} patients and ${seeded.referrals} referrals.`);
  }

  app.get("/api/patients", async (_req, res) => {
    const patients = await collections.patients.find().sort({ created_at: -1 }).toArray();
    res.json(patients.map(withoutMongoId));
  });

  app.get("/api/referrals", async (_req, res) => {
    const referrals = await collections.referrals.find().sort({ created_at: -1 }).toArray();
    const referralsWithPatients = await Promise.all(referrals.map(async (referral) => {
      const patient = await collections.patients.findOne({ id: referral.patient_id });
      return { ...withoutMongoId(referral), patient_name: patient?.name };
    }));
    res.json(referralsWithPatients);
  });

  app.get("/api/stats", async (_req, res) => {
    const [totalPatients, activeReferrals, completedReferrals, recentPatients, recentReferrals] = await Promise.all([
      collections.patients.countDocuments(),
      collections.referrals.countDocuments({ status: "pending" }),
      collections.referrals.countDocuments({ status: "completed" }),
      collections.patients.find().sort({ created_at: -1 }).limit(5).toArray(),
      collections.referrals.find().sort({ created_at: -1 }).limit(5).toArray(),
    ]);
    const recentReferralActivity = await Promise.all(recentReferrals.map(async (referral) => {
      const patient = await collections.patients.findOne({ id: referral.patient_id });
      return { type: "referral" as const, created_at: referral.created_at, patient_name: patient?.name ?? "Unknown", detail: referral.to_hospital };
    }));
    const recentActivity = [
      ...recentReferralActivity,
      ...recentPatients.map((patient) => ({ type: "patient" as const, created_at: patient.created_at, patient_name: patient.name, detail: "Registered" })),
    ].sort((first, second) => second.created_at.getTime() - first.created_at.getTime()).slice(0, 5);

    res.json({ totalPatients, activeReferrals, completedReferrals, recentActivity });
  });

  app.post("/api/patients", async (req, res) => {
    const { name, age, gender, contact, address } = req.body;
    const patient = { id: uuidv4(), name, age, gender, contact, address, created_at: new Date() };
    await collections.patients.insertOne(patient);
    res.json(withoutMongoId(patient));
  });

  app.get("/api/patients/:id/records", async (req, res) => {
    const records = await collections.healthRecords.find({ patient_id: req.params.id }).sort({ created_at: -1 }).toArray();
    res.json(records.map(withoutMongoId));
  });

  app.post("/api/records", async (req, res) => {
    const { patient_id, doctor_id, diagnosis, prescription, reports } = req.body;
    const record = { id: uuidv4(), patient_id, doctor_id, diagnosis, prescription, reports: JSON.stringify(reports ?? null), created_at: new Date() };
    await collections.healthRecords.insertOne(record);
    res.json({ id: record.id, patient_id: record.patient_id, diagnosis: record.diagnosis });
  });

  app.post("/api/referrals", async (req, res) => {
    const { patient_id, from_hospital, to_hospital, reason } = req.body;
    const referral = { id: uuidv4(), patient_id, from_hospital, to_hospital, reason, status: "pending" as const, token: uuidv4(), created_at: new Date() };
    await collections.referrals.insertOne(referral);
    await collections.referralHistory.insertOne({ id: uuidv4(), referral_id: referral.id, status: "pending", created_at: new Date() });
    res.json({ id: referral.id, token: referral.token });
  });

  app.get("/api/referrals/:token", async (req, res) => {
    const referral = await collections.referrals.findOne({ token: req.params.token });
    if (!referral) {
      res.status(404).json({ error: "Referral not found" });
      return;
    }

    const [patient, records, history] = await Promise.all([
      collections.patients.findOne({ id: referral.patient_id }),
      collections.healthRecords.find({ patient_id: referral.patient_id }).sort({ created_at: -1 }).limit(5).toArray(),
      collections.referralHistory.find({ referral_id: referral.id }).sort({ created_at: -1 }).toArray(),
    ]);
    res.json({
      referral: { ...withoutMongoId(referral), patient_name: patient?.name, age: patient?.age, gender: patient?.gender },
      records: records.map(withoutMongoId),
      history: history.map(withoutMongoId),
    });
  });

  app.patch("/api/referrals/:token/status", async (req, res) => {
    const { status } = req.body;
    const referral = await collections.referrals.findOne({ token: req.params.token });
    if (referral) {
      await collections.referrals.updateOne({ token: req.params.token }, { $set: { status } });
      await collections.referralHistory.insertOne({ id: uuidv4(), referral_id: referral.id, status, created_at: new Date() });
    }
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
    } catch (error) {
      console.error("Vite dev server start error:", error);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  server.on("error", (error: NodeJS.ErrnoException) => {
    console.error(error.code === "EADDRINUSE" ? `Port ${port} is already in use.` : "Server error:", error);
    process.exit(1);
  });
  process.once("SIGINT", () => void client.close());
  process.once("SIGTERM", () => void client.close());
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});