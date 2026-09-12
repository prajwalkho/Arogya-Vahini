import { Collection, Db, MongoClient, ObjectId } from "mongodb";

export interface PatientDocument {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address: string;
  created_at: Date;
}

export interface HealthRecordDocument {
  id: string;
  patient_id: string;
  doctor_id?: string;
  diagnosis: string;
  prescription: string;
  reports: string;
  created_at: Date;
}

export interface ReferralDocument {
  id: string;
  patient_id: string;
  from_hospital: string;
  to_hospital: string;
  reason: string;
  status: "pending" | "completed";
  token: string;
  created_at: Date;
}

export interface ReferralHistoryDocument {
  id: string;
  referral_id: string;
  status: string;
  created_at: Date;
}

export type StoredDocument<T> = T & { _id?: ObjectId };

export interface MongoCollections {
  patients: Collection<PatientDocument>;
  healthRecords: Collection<HealthRecordDocument>;
  referrals: Collection<ReferralDocument>;
  referralHistory: Collection<ReferralHistoryDocument>;
}

export async function connectMongo(): Promise<{ client: MongoClient; database: Db; collections: MongoCollections }> {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL is required. Add it to .env.local before starting the server.");
  }

  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
  } catch (error) {
    await client.close().catch(() => undefined);
    if ((error as NodeJS.ErrnoException).code === "ENOTFOUND") {
      throw new Error("MongoDB Atlas hostname could not be resolved. Copy the exact Driver connection string from Atlas into MONGO_URL in .env.local.");
    }
    throw error;
  }
  const database = client.db(process.env.MONGO_DB_NAME ?? "arogya_vahini");
  const collections: MongoCollections = {
    patients: database.collection<PatientDocument>("patients"),
    healthRecords: database.collection<HealthRecordDocument>("health_records"),
    referrals: database.collection<ReferralDocument>("referrals"),
    referralHistory: database.collection<ReferralHistoryDocument>("referral_history"),
  };

  await Promise.all([
    collections.patients.createIndex({ id: 1 }, { unique: true }),
    collections.healthRecords.createIndex({ id: 1 }, { unique: true }),
    collections.referrals.createIndex({ id: 1 }, { unique: true }),
    collections.referrals.createIndex({ token: 1 }, { unique: true }),
    collections.referralHistory.createIndex({ id: 1 }, { unique: true }),
  ]);

  return { client, database, collections };
}

export function withoutMongoId<T extends object>(document: T): Omit<T, "_id"> {
  const { _id: _, ...result } = document as T & { _id?: ObjectId };
  return result as Omit<T, "_id">;
}