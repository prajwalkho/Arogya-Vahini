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
- **SQLite** - Lightweight database with better-sqlite3
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
Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
APP_URL=http://localhost:3000
```

### 4. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

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
└── arogya_vahini.db    # SQLite database (auto-generated)
```

## 🔍 API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id/records` - Get patient health records

### Referrals
- `GET /api/referrals` - Get all referrals
- `POST /api/referrals` - Create new referral

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

### Author
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
