import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { connectMongo, MongoCollections } from "./mongo";

dotenv.config({ path: ".env.local" });

export async function seedDatabase(collections: MongoCollections): Promise<{ patients: number; referrals: number; healthRecords: number }> {
  const patientCount = await collections.patients.countDocuments();

  const names = ["Aarav", "Aditi", "Arjun", "Ananya", "Bhavya", "Chaitanya", "Deepika", "Esha", "Gautam", "Ishani", "Kabir", "Meera", "Nikhil", "Pooja", "Rohan", "Sanya", "Vihaan", "Zoya"];
  const hospitals = ["District General", "City Specialist", "Rural Health Center B", "Apex Medical", "LifeCare Hospital"];
  const patients = [];
  const referrals = [];
  const referralHistory = [];

  if (patientCount < 10) {
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
  }

  const allPatients = await collections.patients.find({}, { projection: { id: 1, created_at: 1 } }).toArray();
  const patientsWithRecords = await collections.healthRecords.distinct("patient_id");
  const patientsNeedingRecords = allPatients.filter((patient) => !patientsWithRecords.includes(patient.id));
  const diagnoses = [
    { diagnosis: "Type 2 Diabetes Mellitus", prescription: "Metformin 500 mg twice daily; maintain a low-sugar diet.", reports: "HbA1c: 7.2%; fasting glucose elevated." },
    { diagnosis: "Essential Hypertension", prescription: "Amlodipine 5 mg once daily; monitor blood pressure weekly.", reports: "BP: 152/94 mmHg; ECG normal." },
    { diagnosis: "Acute Respiratory Infection", prescription: "Rest, oral fluids, and prescribed antibiotic course for 5 days.", reports: "Chest examination indicates mild congestion." },
    { diagnosis: "Iron Deficiency Anemia", prescription: "Ferrous sulfate once daily with an iron-rich diet.", reports: "Hemoglobin: 9.8 g/dL; serum ferritin low." },
    { diagnosis: "Gastritis", prescription: "Omeprazole 20 mg before breakfast for 14 days; avoid spicy foods.", reports: "Abdominal examination unremarkable." },
    { diagnosis: "Seasonal Allergic Rhinitis", prescription: "Cetirizine 10 mg at night and saline nasal rinse.", reports: "Allergy symptoms observed; oxygen saturation normal." },
    { diagnosis: "Musculoskeletal Back Pain", prescription: "Paracetamol as needed, stretching, and posture therapy.", reports: "No neurological deficit; lumbar mobility reduced." },
    { diagnosis: "Urinary Tract Infection", prescription: "Increase water intake and complete the prescribed antibiotic course.", reports: "Urine test positive for leukocytes." },
    { diagnosis: "Migraine Without Aura", prescription: "Hydration, regular sleep, and prescribed medication during attacks.", reports: "Neurological examination normal." },
    { diagnosis: "Dermatitis", prescription: "Apply prescribed topical cream twice daily; avoid known irritants.", reports: "Localized skin inflammation; no secondary infection." },
    { diagnosis: "Vitamin D Deficiency", prescription: "Weekly vitamin D supplement for 8 weeks and safe sunlight exposure.", reports: "25-OH Vitamin D: 16 ng/mL." },
    { diagnosis: "Osteoarthritis of Knee", prescription: "Low-impact exercise, weight management, and pain relief as needed.", reports: "X-ray shows mild joint-space narrowing." },
  ];
  const healthRecords = patientsNeedingRecords.map((patient, index) => {
    const condition = diagnoses[index % diagnoses.length];
    return {
      id: uuidv4(),
      patient_id: patient.id,
      doctor_id: `DR-${String((index % 18) + 1).padStart(3, "0")}`,
      ...condition,
      created_at: new Date(patient.created_at.getTime() + 1000 * 60 * 60 * 2),
    };
  });

  if (healthRecords.length > 0) {
    await collections.healthRecords.insertMany(healthRecords);
  }

  return { patients: patients.length, referrals: referrals.length, healthRecords: healthRecords.length };
}

async function main(): Promise<void> {
  const { client, collections } = await connectMongo();
  try {
    const seeded = await seedDatabase(collections);
    console.log(`Seed complete: ${seeded.patients} patients, ${seeded.referrals} referrals, and ${seeded.healthRecords} medical histories added.`);
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