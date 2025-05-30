# 📦 IOM Backend

This is the backend API for **Icepik's Octo Manager (IOM)** — a multi-user 3D printing management system. It handles authentication, file uploads, print job queuing, role-based access, email notifications, and analytics.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- OctoPrint server (configured for each printer)
- SMTP email credentials
- `.env` configuration

---

## ⚙️ Installation

```bash
git clone https://github.com/Icepikd3v/iom-backend.git
cd iom-backend
npm install

🧪 Running the Backend
## Development
npm run dev

## Production
npm start

## Testing
npm test

iom-backend/
├── controllers/           # Route controllers (auth, upload, print jobs)
├── middleware/            # Auth & admin protection middleware
├── models/                # Mongoose schemas
├── routes/                # Express route definitions
├── services/              # OctoPrint, email, analytics handlers
├── test/                  # Jest test files
├── utils/                 # Startup checks, helpers
├── .env.example           # Example environment config
└── server.js              # Main Express server entry point

🔐 Environment Variables
## Create a .env file in the project root using .env.example as a template:
cp .env.example .env

## Add your environment variables:
PORT=3001
MONGO_URI=mongodb://localhost:27017/iom
JWT_SECRET=your_jwt_secret

# OctoPrint
OCTOPRINT_BASE_URL=http://192.168.1.32
OCTOPRINT_API_KEY=your_octoprint_key
OCTOPRINT_MULTICOLOR_PATH=/api/files/local
OCTOPRINT_DIRECT_PATH=/api/files/local

# Email (for notifications)
EMAIL_HOST=smtp.yourmail.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASS=your_email_password


⸻

🔄 Key Features
	•	✅ JWT-based user authentication
	•	✅ Email verification and notifications
	•	✅ GCODE file uploads with printer selection
	•	✅ Print job queuing and management
	•	✅ Subscription-based access control
	•	✅ Admin-only lifecycle actions (pause, cancel, ship)
	•	✅ Analytics tracking and logging
	•	✅ Role-based route protection
	•	✅ Modular route structure and clean architecture

⸻

✅ Testing

Unit and integration tests included:
	•	test/auth.test.js: User auth & JWT validation
	•	test/upload.test.js: File upload and storage logic

🧪 test/printJobs.test.js was deprecated due to real OctoPrint dependency and email I/O.


## Run test:
npm test

## 📬 API Status Check

You can verify the API is running with:

Response:

{
  "success": true,
  "message": "API is running"
}

🛠 Built With
	•	Express.js
	•	MongoDB & Mongoose
	•	JWT for Auth
	•	OctoPrint API
	•	Nodemailer
	•	Jest + Supertest

⸻

🧑‍💻 Author

Samuel “Icepik” Farmer
GitHub: Icepikd3v, FarmerSamuel-FS

⸻

📄 License

This project is licensed under the MIT License.

```
