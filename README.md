<div align="center">

<img src="https://img.shields.io/badge/Maharashtra-Farmer%20Portal-1a7a3c?style=for-the-badge&logo=leaf&logoColor=white" alt="Maharashtra Farmer Portal"/>

# 🌾 Krushi Sahayak — कृषी सहायक

### AI-Powered Farmer Subsidy Portal for Maharashtra

*Empowering 1.5 crore Maharashtra farmers to discover, apply for, and track government subsidy schemes through AI and real-time digital workflows.*

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Gemini AI](https://img.shields.io/badge/Gemini%202.0%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

<br/>

![Project Status](https://img.shields.io/badge/Status-Completed-25a050?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-e8650a?style=flat-square)
![Languages](https://img.shields.io/badge/Languages-English%20%2B%20Marathi-f0a500?style=flat-square)
![Schemes](https://img.shields.io/badge/Schemes-32%20Real%20Govt%20Schemes-1a7a3c?style=flat-square)


</div>

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [AI Recommendation System](#-ai-recommendation-system)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Government Schemes](#-government-schemes-covered)
- [Team](#-team)

---

## 🌱 About the Project

**Krushi Sahayak** (कृषी सहायक) is a full-stack bilingual web portal that bridges the gap between Maharashtra farmers and government subsidy schemes. The platform uses **Google Gemini AI** to recommend the most relevant schemes based on a farmer's profile and provides a complete **apply → track → approve** workflow.

> **"Only 20% of eligible farmers successfully access government subsidies — we are fixing that."**

---

## ❗ Problem Statement

| Challenge | Impact |
|-----------|--------|
| Language barrier — forms only in English | Rural farmers cannot apply |
| No awareness of available schemes | Subsidies go unclaimed |
| Complex multi-step application process | High rejection rate |
| No real-time status tracking | Farmers lose hope & follow-up |
| Digital divide in rural Maharashtra | Low adoption of online portals |

---

## ✨ Key Features

### 👨‍🌾 Farmer Side
- ✅ **OTP + Password Login** — bilingual, mobile-first
- ✅ **AI Scheme Recommendations** — Gemini 2.0 Flash API
- ✅ **32 Govt. Schemes** — from 7 departments (MahaDBT, Central, etc.)
- ✅ **5-Step Application Form** — with document checklist
- ✅ **Real-Time Tracking** — status timeline with notifications
- ✅ **Bilingual UI** — English + मराठी toggle

### 🏛️ Authority Side
- ✅ **Authority Dashboard** — all farmer applications in one view
- ✅ **Approve / Reject** — with reason + farmer notification
- ✅ **Real-Time Stats** — pending, approved, disbursed amounts
- ✅ **Bulk Approve** — AI-screened safe applications
- ✅ **District-wise Analytics** — application distribution

---

## 🤖 AI Recommendation System

The system uses a **hybrid AI approach** — primary Gemini AI with a custom algorithm fallback:

```
Farmer Profile
      │
      ▼
┌─────────────────────────────────────────┐
│       Is Gemini API available?          │
└────────────┬────────────────┬───────────┘
             │ YES            │ NO (fallback)
             ▼                ▼
    ┌──────────────┐  ┌──────────────────────┐
    │ Gemini 2.0   │  │  Weighted Scoring    │
    │ Flash API    │  │  Algorithm           │
    │              │  │  14 params × 32      │
    │ Sends farmer │  │  schemes             │
    │ profile as   │  │  Min score = 30/100  │
    │ LLM prompt   │  │                      │
    └──────┬───────┘  └──────────┬───────────┘
           │                     │
           ▼                     ▼
    ┌──────────────────────────────────────┐
    │        Top 4 Schemes Selected       │
    │    Sorted by match score / reason   │
    └──────────────────────────────────────┘
                      │
                      ▼
            Saved to session cache
                      │
                      ▼
         Displayed to farmer with
         match % · amount · Apply Now
```

### Weighted Scoring — Example
```
Scheme: Drip Irrigation
─────────────────────────────
Sugarcane crop        → +25 pts
Land: 2–5 acres       → +20 pts
Well irrigation       → +20 pts
OBC category          → +15 pts
Solapur district      → +10 pts
─────────────────────────────
Total Score           →  90/100  ✅ Recommended
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JS | UI pages (13 pages) |
| **Backend** | Node.js, Express.js | REST API server |
| **Database** | MongoDB, Mongoose | Data storage |
| **Auth** | JWT, Bcrypt | Secure login |
| **AI** | Google Gemini 2.0 Flash | Scheme recommendations |
| **OTP** | Fast2SMS API | Mobile OTP delivery |
| **Icons** | Lucide Icons | UI icon library |
| **DevTools** | VS Code, Postman, Git | Development |

---

## 📁 Project Structure

```
KRUSHI-SAHAYAK/
│
├── backend/                    ← Node.js + Express server
│   ├── config/
│   │   └── db.js               ← MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   ← Register, Login, OTP, Authority
│   │   ├── applicationController.js  ← Submit, Track, Approve
│   │   ├── farmerController.js ← Profile CRUD
│   │   └── notificationController.js ← Notifications
│   ├── middleware/
│   │   ├── auth.js             ← JWT protect middleware
│   │   └── errorHandler.js     ← Global error handling
│   ├── models/
│   │   ├── Farmer.js           ← Farmer schema
│   │   ├── Application.js      ← Application schema
│   │   └── Notification.js     ← Notification schema
│   ├── routes/
│   │   ├── applications.js     ← /api/applications
│   │   ├── auth.js             ← /api/auth
│   │   ├── farmer.js           ← /api/farmer
│   │   └── notifications.js    ← /api/notifications
│   ├── .env.example            ← Environment template
│   ├── package.json
│   └── server.js               ← Entry point
│
└── frontend/                   ← HTML/CSS/JS pages
    ├── js/
    │   ├── api.js              ← API connector (all fetch calls)
    │   └── main.js             ← Utility functions
    └── pages/
        ├── index.html          ← Landing page
        ├── farmer-register.html
        ├── farmer-login.html
        ├── farmer-dashboard.html
        ├── schemes.html        ← Browse 32 schemes
        ├── ai-recommendation.html ← Gemini AI page
        ├── apply-scheme.html   ← 5-step application
        ├── tracking.html       ← Application tracking
        ├── notifications.html
        ├── edit-profile.html
        ├── authority-login.html
        └── authority-dashboard.html
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/krushi-sahayak.git
cd krushi-sahayak
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/krushi-sahayak
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
AUTHORITY_USERNAME=admin
AUTHORITY_PASSWORD=your_password_here
AUTHORITY_JWT_SECRET=your_authority_secret_here
FRONTEND_URL=http://127.0.0.1:5500
FAST2SMS_API_KEY=your_fast2sms_key_here
GEMINI_API_KEY=your_gemini_key_here
```

**4. Start the backend server**
```bash
npm run dev
```
> Server runs on `http://localhost:5000`

**5. Start the frontend**
```
Open frontend/pages/index.html with VS Code Live Server
```
> Frontend runs on `http://127.0.0.1:5500`

**6. Authority Login**
```
URL:      frontend/pages/authority-login.html
Username: admin
Password: (set in your .env)
```

---

## 📡 API Endpoints

### Auth Routes `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new farmer |
| POST | `/login` | Login with password |
| POST | `/send-otp` | Send OTP to mobile |
| POST | `/verify-otp` | Verify OTP & login |
| POST | `/authority/login` | Authority login |
| GET | `/me` | Get current farmer |

### Application Routes `/api/applications`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Farmer | Submit application |
| GET | `/my` | Farmer | My applications |
| GET | `/all` | Authority | All applications |
| GET | `/stats` | Authority | Dashboard stats |
| PUT | `/:id/status` | Authority | Approve / Reject |

### Farmer Routes `/api/farmer`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get full profile |
| PUT | `/personal` | Update personal info |
| PUT | `/farm` | Update farm details |
| PUT | `/bank` | Update bank details |
| PUT | `/password` | Change password |

### Notifications `/api/notifications`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all notifications |
| PUT | `/read-all` | Mark all as read |
| PUT | `/:id/read` | Mark one as read |
| DELETE | `/:id` | Delete notification |

---

## 🏛️ Government Schemes Covered

<details>
<summary><b>🌾 Agriculture Dept — MahaDBT (9 schemes)</b></summary>

- Drip Irrigation Subsidy — up to ₹80,000
- Tractor Purchase Subsidy — up to ₹1,50,000
- Farm Pond Scheme — up to ₹75,000
- Sprinkler Irrigation Subsidy — up to ₹50,000
- Seed & Fertilizer Subsidy — up to ₹15,000
- Greenhouse / Polyhouse — up to ₹1,40,000
- Organic Farming Scheme — up to ₹40,000
- Farm Machinery Subsidy — up to ₹1,00,000
- Farm Warehouse — up to ₹3,00,000
</details>

<details>
<summary><b>⚡ Energy Dept (3 schemes)</b></summary>

- Mukhyamantri Solar Pump — up to ₹2,20,000
- Biogas Plant Subsidy — up to ₹40,000
- Solar Fencing Subsidy — up to ₹90,000
</details>

<details>
<summary><b>🇮🇳 Central Govt Schemes (6 schemes)</b></summary>

- PM Kisan Samman Nidhi — ₹6,000/year
- Namo Shetkari Maha Samman — ₹6,000/year
- PM Fasal Bima Yojana — up to ₹2,00,000
- Kisan Credit Card — up to ₹3,00,000
- PM KUSUM Solar — 90% subsidy
- Soil Health Card — Free
</details>

<details>
<summary><b>🐄 Animal Husbandry (5 schemes)</b></summary>

- Cattle Shed Construction — up to ₹70,000
- Dairy Development Scheme — up to ₹2,50,000
- Poultry Farming Subsidy — up to ₹1,00,000
- Goat & Sheep Rearing — up to ₹75,000
- Fishery Development — up to ₹1,50,000
</details>

<details>
<summary><b>🍇 Horticulture (4 schemes)</b></summary>

- Horticulture Development — up to ₹1,00,000
- Mango & Fruit Development — up to ₹80,000
- Floriculture Development — up to ₹60,000
- Cold Storage & Pack House — up to ₹2,00,000
</details>

<details>
<summary><b>💧 Water Conservation (3 schemes)</b></summary>

- Borewell / Well Digging — up to ₹2,50,000
- Watershed Development — ₹5,000/hectare
- Jalyukt Shivar Abhiyan — up to ₹50,000
</details>

<details>
<summary><b>🎯 SC/ST Special (2 schemes)</b></summary>

- SC/ST Farmer Special Assistance — up to ₹50,000
- Leased Land Farmer Support — up to ₹25,000
</details>

---

## 🔐 Security Features

- 🔒 **Bcrypt** — passwords hashed, never stored as plain text
- 🎫 **JWT Tokens** — separate tokens for farmer (7d) and authority (7d)
- 🛡️ **protectAuthority middleware** — authority routes blocked for farmers
- 🌐 **CORS** — only whitelisted frontend origins allowed
- ⏱️ **Rate Limiting** — 10 login attempts per 15 minutes
- 📱 **OTP Expiry** — auto-expire after 3 minutes

---

## 📊 Project Stats

| Metric | Count |
|--------|-------|
| Total Pages | 13 |
| API Endpoints | 18 |
| Government Schemes | 32 |
| Departments Covered | 7 |
| AI Parameters | 14 |
| Supported Languages | 2 (EN + MR) |
| Database Collections | 3 |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [MahaDBT Portal](https://mahadbt.maharashtra.gov.in) — Scheme data reference
- [Google Gemini AI](https://ai.google.dev) — AI recommendation engine
- [Fast2SMS](https://fast2sms.com) — OTP delivery service
- [Lucide Icons](https://lucide.dev) — Icon library
- [MongoDB Atlas](https://mongodb.com) — Database hosting

---

<div align="center">

**Made with ❤️ for Maharashtra Farmers**

*🌾 जय जवान · जय किसान 🌾*

[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/krushi-sahayak?style=social)](https://github.com/YOUR_USERNAME/krushi-sahayak)

</div>
