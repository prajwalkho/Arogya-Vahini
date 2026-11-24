# Arogya-Vahini

## The Universal Rural Referral & Health Vault

A secure digital healthcare referral system designed to improve patient care coordination between rural Primary Health Centers (PHCs) and specialist hospitals. Features QR-based health tokens, offline synchronization, and AI-powered assistance for seamless healthcare delivery in remote areas.

🏁 Live Arogya-Vahini

Demo URL - [Arogya-Vahini](https://arogya-vahini-dun.vercel.app/)


## 🚀 Features

- **Patient Management**: Comprehensive patient registration and profile management
- **Referral System**: Streamlined referral process with unique tokens and status tracking
- **QR Code Integration**: Generate and scan QR codes for quick patient data access
- **Health Records**: Secure storage and retrieval of patient health records
- **Offline Synchronization**: Works in low-connectivity rural areas
- **AI Assistance**: Powered by Google Gemini for intelligent healthcare insights
- **Real-time Dashboard**: Monitor patient statistics and referral status
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database for patients, health records, and referrals
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### AI & Utilities
- **Google Generative AI** - AI-powered healthcare assistance
- **QR Code Generation** - For patient tokens
- **HTML5 QR Scanner** - QR code reading capability
- **UUID** - Unique identifier generation

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** for version control

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env.local` in the project root by copying the example:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and replace the placeholders with your own values. For `MONGO_URL`, use the exact Driver connection string from MongoDB Atlas. `.env.example` is only a template; the app loads `.env.local`. Do not commit `.env.local`.

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
APP_URL=http://localhost:3000
MONGO_URL=your_mongodb_connection_string
MONGO_DB_NAME=arogya_vahini
```

### 4. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Seed the Local Database

The development server seeds the database automatically when fewer than 10 patients exist. To seed it explicitly, run:

```bash
npm run seed
```

The command creates the MongoDB collections when needed and is safe to run again after the database has been seeded. The MongoDB URL is read from `MONGO_URL` in `.env.local`.

### Deploying privately to Vercel

Vercel sets `VERCEL=1`. By default, this app keeps patient, health-record, and referral APIs private in Vercel deployments. To make the data available to your Vercel team:

1. Enable Vercel Deployment Protection for production and preview deployments, and restrict access to the authorized team.
2. In Vercel project settings, set `MONGO_URL` and `MONGO_DB_NAME` to the same Atlas cluster and database used for the data you want to display.
3. Set `VERCEL_PRIVATE_DATA_ACCESS=true` in the same Vercel environments. Do this only after Deployment Protection is active.
4. Ensure `PUBLIC_DEMO_MODE` is not set to `true`. If this is a demo/test database and you want Vercel to seed demo records, set `SEED_DEMO_DATA=true`; then redeploy.

The private-data flag is an explicit opt-in; without it, Vercel continues to deny private API access. `PUBLIC_DEMO_MODE=true` always keeps private data blocked. Demo seeding is off by default on Vercel and can be explicitly enabled with `SEED_DEMO_DATA=true`. Seeding is additive: it does not delete existing records, and it creates sample health histories only for newly seeded demo patients. Use it only with a demo/test database.

This setup grants access to anyone admitted by the Vercel Deployment Protection policy; it does not provide per-user roles inside the app. Do not use it for a public deployment or expose real patient data publicly.


## 📖 Usage

### For Healthcare Providers

1. **Register Patients**: Add new patients with their basic information
2. **Create Referrals**: Generate referral tokens for specialist consultation
3. **Track Status**: Monitor referral progress and patient outcomes
4. **Access Records**: View and update patient health records
5. **Generate QR Codes**: Create scannable tokens for quick access

### For Rural Health Centers

1. **Offline Operation**: System works without internet connectivity
2. **Data Synchronization**: Automatic sync when connection is restored
3. **QR Scanning**: Quick patient identification and data retrieval
4. **Referral Management**: Seamless coordination with specialist hospitals

## 🏗️ Project Structure

```
arogya-vahini/
├── src/
│   ├── api.ts          # API client functions
│   ├── App.tsx         # Main React application
│   ├── main.tsx        # Application entry point
│   ├── types.ts        # TypeScript type definitions
│   └── index.css       # Global styles
├── server.ts           # Express server with API routes
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── mongo.ts            # MongoDB connection and collection definitions
└── seed.ts             # MongoDB demo-data seed command
```

## 🔍 API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get one patient
- `POST /api/patients` - Create new patient
- `PATCH /api/patients/:id` - Update patient fields
- `DELETE /api/patients/:id` - Delete patient and related records/referrals
- `GET /api/patients/:id/records` - Get patient health records

### Health Records
- `GET /api/records/:id` - Get one health record
- `POST /api/records` - Create health record
- `PATCH /api/records/:id` - Update health record fields
- `DELETE /api/records/:id` - Delete health record

### Referrals
- `GET /api/referrals` - Get all referrals
- `POST /api/referrals` - Create new referral
- `GET /api/referrals/id/:id` - Get one referral by ID
- `PATCH /api/referrals/id/:id` - Update referral fields
- `DELETE /api/referrals/id/:id` - Delete referral and status history
- `GET /api/referrals/:token` - Get referral details, records, and history by token
- `PATCH /api/referrals/:token/status` - Update referral status and append history

### Statistics
- `GET /api/stats` - Get dashboard statistics

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot find module" errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. Database connection issues**
- Ensure the `arogya_vahini.db` file is not corrupted
- The database is automatically created on first run
- Do not open `.db` files in text editors

**3. Gemini API errors**
- Verify your `GEMINI_API_KEY` is correct
- Check your internet connection
- Ensure the API key has proper permissions

**4. Port already in use**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or change port in server.ts
```

**5. Build errors**
```bash
# Run TypeScript check
npm run lint
# Clear build cache
npm run clean
npm run build
```

### Development Tips

- Use `npm run lint` to check for TypeScript errors
- The application auto-reloads during development
- Database changes are persisted between restarts
- Check browser console for client-side errors
- Check terminal output for server-side errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for rural healthcare improvement initiatives
- Inspired by the need for better healthcare coordination in remote areas
- Thanks to the open-source community for the amazing tools and libraries

### Developer
- **Name:** Prajwal Khot
- **Email:** [prajwalkhot39@gmail.com]
- **GitHub:** [@prajwalkho](https://github.com/prajwalkho)
- **LinkedIn:** [www.linkedin.com/in/prajwal-p-khot]
  
## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the code comments for implementation details

---

**Made with ❤️ for better rural healthcare**
