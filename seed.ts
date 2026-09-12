import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { connectMongo, MongoCollections } from "./mongo";

dotenv.config({ path: ".env.local" });

export async function seedDatabase(collections: MongoCollections): Promise<{ patients: number; referrals: number }> {
  const patientCount = await collections.patients.countDocuments();
  if (patientCount >= 10) {
    return { patients: 0, referrals: 0 };
  }

  const names = ["Aarav", "Aditi", "Arjun", "Ananya", "Bhavya", "Chaitanya", "Deepika", "Esha", "Gautam", "Ishani", "Kabir", "Meera", "Nikhil", "Pooja", "Rohan", "Sanya", "Vihaan", "Zoya"];
  const hospitals = ["District General", "City Specialist", "Rural Health Center B", "Apex Medical", "LifeCare Hospital"];
  const patients = [];
  const referrals = [];
  const referralHistory = [];

  for (let i = 0; i < 850; i += 1) {
    const patientId = uuidv4();
    const createdAt = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30);
    patients.push({
      id: patientId,
      name: `${names[i % names.length]} ${String.fromCharCode(65 + (i % 26))}.`,
      age: 18 + (i % 60),
      gender: i % 2 === 0 ? "Male" : "Female",
      contact: `98765${i.toString().padStart(5, "0")}`,
      address: `${i % 100} Main St, Village ${Math.floor(i / 10)}`,
      created_at: createdAt,
    });

    if (i < 460) {
      const referralId = uuidv4();
      const status: "pending" | "completed" = i < 120 ? "pending" : "completed";
      const referralDate = new Date(createdAt.getTime() + 1000 * 60 * 60);
      referrals.push({
        id: referralId,
        patient_id: patientId,
        from_hospital: "Primary Health Center A",
        to_hospital: hospitals[i % hospitals.length],
        reason: "Specialist consultation required",
        status,
        token: uuidv4(),
        created_at: referralDate,
      });
      referralHistory.push({ id: uuidv4(), referral_id: referralId, status: "pending", created_at: referralDate });
      if (status === "completed") {
        referralHistory.push({ id: uuidv4(), referral_id: referralId, status: "completed", created_at: new Date(referralDate.getTime() + 1000 * 60 * 60 * 24) });
      }
    }
  }

  await collections.patients.insertMany(patients);
  await collections.referrals.insertMany(referrals);
  await collections.referralHistory.insertMany(referralHistory);
  return { patients: patients.length, referrals: referrals.length };
}

async function main(): Promise<void> {
  const { client, collections } = await connectMongo();
  try {
    const seeded = await seedDatabase(collections);
    console.log(`Seed complete: ${seeded.patients} patients and ${seeded.referrals} referrals added.`);
  } finally {
    await client.close();
  }
}

if (process.argv[1]?.endsWith("seed.ts")) {
  main().catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  });
}