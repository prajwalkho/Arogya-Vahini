import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { connectMongo, withoutMongoId } from "./mongo";
import { seedDatabase } from "./seed";

export async function createApp(includeFrontend = process.env.VERCEL !== "1"): Promise<{ app: express.Express; client: Awaited<ReturnType<typeof connectMongo>>["client"] }> {
  const { client, collections } = await connectMongo();
  const app = express();
  const publicDemoMode = process.env.PUBLIC_DEMO_MODE === "true" || process.env.VERCEL === "1";

  app.use(express.json());

  const seeded = await seedDatabase(collections);
  if (seeded.patients > 0 || seeded.healthRecords > 0) {
    console.log(`Seeded ${seeded.patients} patients, ${seeded.referrals} referrals, and ${seeded.healthRecords} medical histories.`);
  }

  app.get("/api/patients", async (_req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Patient directory is private." });
      return;
    }
    const patients = await collections.patients.find().sort({ created_at: -1 }).toArray();
    res.json(patients.map(withoutMongoId));
  });

  app.get("/api/referrals", async (_req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Referral directory is private." });
      return;
    }
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

    res.json({
      totalPatients,
      activeReferrals,
      completedReferrals,
      recentActivity: publicDemoMode
        ? recentActivity.map(({ type, created_at, detail }) => ({ type, created_at, patient_name: "Private patient", detail }))
        : recentActivity,
    });
  });

  app.post("/api/patients", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Patient registration requires private access." });
      return;
    }
    const { name, age, gender, contact, address } = req.body;
    const patient = { id: uuidv4(), name, age, gender, contact, address, created_at: new Date() };
    await collections.patients.insertOne(patient);
    res.json(withoutMongoId(patient));
  });

  app.get("/api/patients/:id", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Patient records are private." });
      return;
    }
    const patient = await collections.patients.findOne({ id: req.params.id });
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    res.json(withoutMongoId(patient));
  });

  app.patch("/api/patients/:id", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Patient updates require private access." });
      return;
    }
    const allowedFields = ["name", "age", "gender", "contact", "address"] as const;
    const updates = Object.fromEntries(
      allowedFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]])
    );
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "At least one patient field is required." });
      return;
    }
    const result = await collections.patients.updateOne({ id: req.params.id }, { $set: updates });
    if (result.matchedCount === 0) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    const patient = await collections.patients.findOne({ id: req.params.id });
    res.json(withoutMongoId(patient!));
  });

  app.delete("/api/patients/:id", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Patient deletion requires private access." });
      return;
    }
    const patient = await collections.patients.findOne({ id: req.params.id });
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    const referrals = await collections.referrals.find({ patient_id: patient.id }, { projection: { id: 1 } }).toArray();
    const referralIds = referrals.map((referral) => referral.id);
    await Promise.all([
      collections.patients.deleteOne({ id: patient.id }),
      collections.healthRecords.deleteMany({ patient_id: patient.id }),
      collections.referrals.deleteMany({ patient_id: patient.id }),
      referralIds.length > 0 ? collections.referralHistory.deleteMany({ referral_id: { $in: referralIds } }) : Promise.resolve(),
    ]);
    res.json({ success: true, id: patient.id });
  });

  app.get("/api/patients/:id/records", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Health records are private." });
      return;
    }
    const records = await collections.healthRecords.find({ patient_id: req.params.id }).sort({ created_at: -1 }).toArray();
    res.json(records.map(withoutMongoId));
  });

  app.get("/api/records/:id", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Health records are private." });
      return;
    }
    const record = await collections.healthRecords.findOne({ id: req.params.id });
    if (!record) {
      res.status(404).json({ error: "Health record not found" });
      return;
    }
    res.json(withoutMongoId(record));
  });

  app.post("/api/records", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Health records require private access." });
      return;
    }
    const { patient_id, doctor_id, diagnosis, prescription, reports, report_files } = req.body;
    const record = { id: uuidv4(), patient_id, doctor_id, diagnosis, prescription, reports: reports ?? "", report_files: report_files ?? [], created_at: new Date() };
    await collections.healthRecords.insertOne(record);
    res.json({ id: record.id, patient_id: record.patient_id, diagnosis: record.diagnosis });
  });

  app.patch("/api/records/:id", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Health record updates require private access." });
      return;
    }
    const allowedFields = ["doctor_id", "diagnosis", "prescription", "reports", "report_files"] as const;
    const updates = Object.fromEntries(
      allowedFields.filter((field) => req.body[field] !== undefined).map((field) => [
        field,
        req.body[field],
      ])
    );
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "At least one health record field is required." });
      return;
    }
    const result = await collections.healthRecords.updateOne({ id: req.params.id }, { $set: updates });
    if (result.matchedCount === 0) {
      res.status(404).json({ error: "Health record not found" });
      return;
    }
    const record = await collections.healthRecords.findOne({ id: req.params.id });
    res.json(withoutMongoId(record!));
  });

  app.delete("/api/records/:id", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Health record deletion requires private access." });
      return;
    }
    const result = await collections.healthRecords.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Health record not found" });
      return;
    }
    res.json({ success: true, id: req.params.id });
  });

  app.post("/api/referrals", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Referrals require private access." });
      return;
    }
    const { patient_id, from_hospital, to_hospital, reason } = req.body;
    const referral = { id: uuidv4(), patient_id, from_hospital, to_hospital, reason, status: "pending" as const, token: uuidv4(), created_at: new Date() };
    await collections.referrals.insertOne(referral);
    await collections.referralHistory.insertOne({ id: uuidv4(), referral_id: referral.id, status: "pending", created_at: new Date() });
    res.json({ id: referral.id, token: referral.token });
  });

  app.get("/api/referrals/id/:id", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Referral details are private." });
      return;
    }
    const referral = await collections.referrals.findOne({ id: req.params.id });
    if (!referral) {
      res.status(404).json({ error: "Referral not found" });
      return;
    }
    res.json(withoutMongoId(referral));
  });

  app.patch("/api/referrals/id/:id", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Referral updates require private access." });
      return;
    }
    const allowedFields = ["from_hospital", "to_hospital", "reason"] as const;
    const updates = Object.fromEntries(
      allowedFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]])
    );
    if (req.body.status !== undefined) {
      if (req.body.status !== "pending" && req.body.status !== "completed") {
        res.status(400).json({ error: "Referral status must be pending or completed." });
        return;
      }
      updates.status = req.body.status;
    }
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "At least one referral field is required." });
      return;
    }
    const referral = await collections.referrals.findOne({ id: req.params.id });
    if (!referral) {
      res.status(404).json({ error: "Referral not found" });
      return;
    }
    await collections.referrals.updateOne({ id: referral.id }, { $set: updates });
    if (updates.status && updates.status !== referral.status) {
      await collections.referralHistory.insertOne({ id: uuidv4(), referral_id: referral.id, status: updates.status, created_at: new Date() });
    }
    const updatedReferral = await collections.referrals.findOne({ id: referral.id });
    res.json(withoutMongoId(updatedReferral!));
  });

  app.delete("/api/referrals/id/:id", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Referral deletion requires private access." });
      return;
    }
    const referral = await collections.referrals.findOne({ id: req.params.id });
    if (!referral) {
      res.status(404).json({ error: "Referral not found" });
      return;
    }
    await Promise.all([
      collections.referrals.deleteOne({ id: referral.id }),
      collections.referralHistory.deleteMany({ referral_id: referral.id }),
    ]);
    res.json({ success: true, id: referral.id });
  });

  app.get("/api/referrals/:token", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Referral details are private." });
      return;
    }
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
      referral: { ...withoutMongoId(referral), patient_name: patient?.name, age: patient?.age, gender: patient?.gender, patient_contact: patient?.contact, patient_address: patient?.address },
      records: records.map(withoutMongoId),
      history: history.map(withoutMongoId),
    });
  });

  app.patch("/api/referrals/:token/status", async (req, res) => {
    if (publicDemoMode) {
      res.status(403).json({ error: "Referral updates require private access." });
      return;
    }
    const { status } = req.body;
    if (status !== "pending" && status !== "completed") {
      res.status(400).json({ error: "Referral status must be pending or completed." });
      return;
    }
    const referral = await collections.referrals.findOne({ token: req.params.token });
    if (!referral) {
      res.status(404).json({ error: "Referral not found" });
      return;
    }
    if (referral.status !== status) {
      await collections.referrals.updateOne({ token: req.params.token }, { $set: { status } });
      await collections.referralHistory.insertOne({ id: uuidv4(), referral_id: referral.id, status, created_at: new Date() });
    }
    res.json({ success: true });
  });

  if (includeFrontend && process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
    } catch (error) {
      console.error("Vite dev server start error:", error);
    }
  } else if (includeFrontend) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  return { app, client };
}

if (process.env.VERCEL !== "1") {
  createApp().then(({ app, client }) => {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${port}`);
    });
    server.on("error", (error: NodeJS.ErrnoException) => {
      console.error(error.code === "EADDRINUSE" ? `Port ${port} is already in use.` : "Server error:", error);
      process.exit(1);
    });
    process.once("SIGINT", () => void client.close());
    process.once("SIGTERM", () => void client.close());
  }).catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}