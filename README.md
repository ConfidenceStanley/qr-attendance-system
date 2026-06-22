# QRoll - QR Attendance Monitoring System

HND Computer Science Final Year Project

## Overview

QR code-based attendance system with three user roles:
- **Admin** - Manages users and courses (Web)
- **Lecturer** - Creates QR sessions (Web)  
- **Student** - Scans QR to mark attendance (Mobile)

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Socket.io
- **Web:** React 19 (Vite), Tailwind CSS, Redux Toolkit
- **Mobile:** React Native (Expo) - Coming in Phase 4
- **Auth:** JWT
- **Email:** Nodemailer + Gmail

## Project Status

- ✅ Phase 1: Authentication
- ✅ Phase 2: Admin Dashboard + User Management
- 🚧 Phase 3: Lecturer Dashboard + QR Sessions (In Progress)
- ⏳ Phase 4: Student Mobile App
- ⏳ Phase 5: Reports + Notifications
- ⏳ Phase 6: Testing + Deployment

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gmail account for email notifications

### Backend
\`\`\`bash
cd backend
npm install
# Create .env file with required variables
npm run dev
\`\`\`

### Web Frontend
\`\`\`bash
cd web-frontend
npm install
# Create .env with VITE_API_URL=http://localhost:5000/api
npm run dev
\`\`\`

### Test Admin Account
- Email: `admin@qrattendance.com`
- Password: `Admin@123`

## License

Educational project - All rights reserved.