import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

const db = new Database("arogya_vahini.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    contact TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS health_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT,
    diagnosis TEXT,
    prescription TEXT,
    reports TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    from_hospital TEXT,
    to_hospital TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    token TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS referral_history (
    id TEXT PRIMARY KEY,
    referral_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referral_id) REFERENCES referrals(id)
  );

`);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT as string, 10) : 3000;

  app.use(express.json());

  // Seed Data if empty
  const patientCount = db.prepare("SELECT COUNT(*) as count FROM patients").get().count;
  if (patientCount < 10) {
    console.log("Seeding 800+ records for demonstration...");
    const insertPatient = db.prepare("INSERT INTO patients (id, name, age, gender, contact, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    const insertReferral = db.prepare("INSERT INTO referrals (id, patient_id, from_hospital, to_hospital, reason, status, token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const insertHistory = db.prepare("INSERT INTO referral_history (id, referral_id, status, created_at) VALUES (?, ?, ?, ?)");

    const names = ["Aarav", "Aditi", "Arjun", "Ananya", "Bhavya", "Chaitanya", "Deepika", "Esha", "Gautam", "Ishani", "Kabir", "Meera", "Nikhil", "Pooja", "Rohan", "Sanya", "Vihaan", "Zoya"];
    const hospitals = ["District General", "City Specialist", "Rural Health Center B", "Apex Medical", "LifeCare Hospital"];
    
    db.transaction(() => {
      for (let i = 0; i < 850; i++) {
        const pId = uuidv4();
        const name = `${names[i % names.length]} ${String.fromCharCode(65 + (i % 26))}.`;
        const age = 18 + (i % 60);
        const gender = i % 2 === 0 ? "Male" : "Female";
        const date = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString();
        
        insertPatient.run(pId, name, age, gender, `98765${i.toString().padStart(5, '0')}`, `${i % 100} Main St, Village ${Math.floor(i/10)}`, date);
        
        if (i < 460) {
          const rId = uuidv4();
          const status = i < 120 ? 'pending' : 'completed';
          const rDate = new Date(new Date(date).getTime() + 1000 * 60 * 60).toISOString();
          insertReferral.run(rId, pId, "Primary Health Center A", hospitals[i % hospitals.length], "Specialist consultation required", status, uuidv4(), rDate);
          insertHistory.run(uuidv4(), rId, 'pending', rDate);
          if (status === 'completed') {
            const cDate = new Date(new Date(rDate).getTime() + 1000 * 60 * 60 * 24).toISOString();
            insertHistory.run(uuidv4(), rId, 'completed', cDate);
          }
        }
      }
    })();
    console.log("Seeding complete.");
  }

  // API Routes
  app.get("/api/patients", (req, res) => {
    const patients = db.prepare("SELECT * FROM patients ORDER BY created_at DESC").all();
    res.json(patients);
  });

  app.get("/api/referrals", (req, res) => {
    const referrals = db.prepare(`
      SELECT r.*, p.name as patient_name 
      FROM referrals r 
      JOIN patients p ON r.patient_id = p.id 
      ORDER BY r.created_at DESC
    `).all();
    res.json(referrals);
  });

  app.get("/api/stats", (req, res) => {
    const totalPatients = db.prepare("SELECT COUNT(*) as count FROM patients").get().count;
    const activeReferrals = db.prepare("SELECT COUNT(*) as count FROM referrals WHERE status = 'pending'").get().count;
    const completedReferrals = db.prepare("SELECT COUNT(*) as count FROM referrals WHERE status = 'completed'").get().count;
    const recentActivity = db.prepare(`
      SELECT 'referral' as type, r.created_at, p.name as patient_name, r.to_hospital as detail
      FROM referrals r
      JOIN patients p ON r.patient_id = p.id
      UNION ALL
      SELECT 'patient' as type, created_at, name as patient_name, 'Registered' as detail
      FROM patients
      ORDER BY created_at DESC
      LIMIT 5
    `).all();
    
    res.json({
      totalPatients,
      activeReferrals,
      completedReferrals,
      recentActivity
    });
  });

  app.post("/api/patients", (req, res) => {
    const { name, age, gender, contact, address } = req.body;
    const id = uuidv4();
    db.prepare("INSERT INTO patients (id, name, age, gender, contact, address) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, name, age, gender, contact, address);
    res.json({ id, name, age, gender, contact, address });
  });

  // No auth routes


  app.get("/api/patients/:id/records", (req, res) => {
    const records = db.prepare("SELECT * FROM health_records WHERE patient_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json(records);
  });

  app.post("/api/records", (req, res) => {
    const { patient_id, doctor_id, diagnosis, prescription, reports } = req.body;
    const id = uuidv4();
    db.prepare("INSERT INTO health_records (id, patient_id, doctor_id, diagnosis, prescription, reports) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, patient_id, doctor_id, diagnosis, prescription, JSON.stringify(reports));
    res.json({ id, patient_id, diagnosis });
  });

  app.post("/api/referrals", (req, res) => {
    const { patient_id, from_hospital, to_hospital, reason } = req.body;
    const id = uuidv4();
    const token = uuidv4(); // This will be used for QR code
    db.prepare("INSERT INTO referrals (id, patient_id, from_hospital, to_hospital, reason, token) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, patient_id, from_hospital, to_hospital, reason, token);
    
    // Record initial status in history
    db.prepare("INSERT INTO referral_history (id, referral_id, status) VALUES (?, ?, ?)")
      .run(uuidv4(), id, 'pending');

    res.json({ id, token });
  });

  app.get("/api/referrals/:token", (req, res) => {
    const referral = db.prepare(`
      SELECT r.*, p.name as patient_name, p.age, p.gender 
      FROM referrals r 
      JOIN patients p ON r.patient_id = p.id 
      WHERE r.token = ?
    `).get(req.params.token);
    
    if (!referral) return res.status(404).json({ error: "Referral not found" });
    
    const records = db.prepare("SELECT * FROM health_records WHERE patient_id = ? ORDER BY created_at DESC LIMIT 5").all(referral.patient_id);
    const history = db.prepare("SELECT * FROM referral_history WHERE referral_id = ? ORDER BY created_at DESC").all(referral.id);
    res.json({ referral, records, history });
  });

  app.patch("/api/referrals/:token/status", (req, res) => {
    const { status } = req.body;
    const referral = db.prepare("SELECT id FROM referrals WHERE token = ?").get(req.params.token);
    
    if (referral) {
      db.prepare("UPDATE referrals SET status = ? WHERE token = ?").run(status, req.params.token);
      db.prepare("INSERT INTO referral_history (id, referral_id, status) VALUES (?, ?, ?)")
        .run(uuidv4(), referral.id, status);
    }
    
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("Vite dev server start error:", err);
      // Continue without Vite middleware so API remains available
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const srv = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  srv.on('error', (err: any) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`, err);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);   
});
