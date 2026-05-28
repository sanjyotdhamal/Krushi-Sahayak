# 🌾 Krushi Sahayak — Backend Setup Guide

## Folder Structure After Setup
```
KRUSHI-SAHAYAK/
├── pages/                     ← your existing HTML files
├── css/
│   └── style.css
├── js/
│   ├── main.js               ← existing shared logic
│   └── api.js                ← NEW: copy from backend folder
└── backend/                  ← NEW: this entire folder
    ├── server.js
    ├── package.json
    ├── .env                  ← you create this
    ├── .env.example
    ├── config/db.js
    ├── models/
    │   ├── Farmer.js
    │   ├── Application.js
    │   └── Notification.js
    ├── controllers/
    │   ├── authController.js
    │   ├── farmerController.js
    │   ├── applicationController.js
    │   └── notificationController.js
    ├── middleware/
    │   ├── auth.js
    │   └── errorHandler.js
    └── routes/
        ├── auth.js
        ├── farmer.js
        ├── applications.js
        └── notifications.js
```

---

## ✅ Step 1 — Install Node.js
Download from: https://nodejs.org (choose LTS version)
Verify: open terminal → `node -v` → should show v18 or higher

---

## ✅ Step 2 — Get Free MongoDB Database
1. Go to https://mongodb.com
2. Click **"Try Free"** → Sign up
3. Create a free **M0 cluster** (Shared, Free forever)
4. Click **"Connect"** → **"Drivers"**
5. Copy your connection string — looks like:
   `mongodb+srv://yourname:yourpass@cluster0.xxxxx.mongodb.net/`

---

## ✅ Step 3 — Create .env File
Inside the `backend/` folder, create a file named `.env` (no extension):

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/krushi-sahayak?retryWrites=true&w=majority
JWT_SECRET=krushi_any_long_random_string_here_2024
JWT_EXPIRE=7d
AUTHORITY_USERNAME=admin
AUTHORITY_PASSWORD=admin123
AUTHORITY_JWT_SECRET=authority_any_long_random_string_2024
FRONTEND_URL=http://127.0.0.1:5500
```

> ⚠️ Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your MongoDB credentials

---

## ✅ Step 4 — Install & Run Backend
Open terminal, navigate to your backend folder:

```bash
cd path/to/krushi-sahayak/backend

# Install all packages
npm install

# Start server (development mode with auto-restart)
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 Krushi Sahayak Server running on port 5000
📡 API Base: http://localhost:5000/api
```

Test it: open browser → http://localhost:5000/api/health
Should show: `{ "success": true, "msg": "🌾 Krushi Sahayak API is running!" }`

---

## ✅ Step 5 — Add api.js to Your Frontend
Copy `api.js` from the backend folder → paste into `js/` folder.

Then add this ONE line to **every HTML page**, just before `</body>`:
```html
<script src="../js/api.js"></script>
<script src="../js/main.js"></script>
```

---

## ✅ Step 6 — Update Your HTML Pages

### farmer-register.html — change the submit function:
```javascript
async function submitRegistration() {
  // ... your existing validation ...

  try {
    const result = await AuthAPI.register({
      name, mobile, aadhaar, category, password,
      district, taluka, village, pincode,
      landSize, landType, mainCrop, irrigation,
      hasCattle, cattleCount,
      bankName, accountHolder, accountNumber, ifscCode,
    });
    showToast('✅ Registration successful! Farmer ID: ' + result.farmer.farmerId, 'green');
    setTimeout(() => window.location.href = 'farmer-dashboard.html', 1500);
  } catch (err) {
    showToast('❌ ' + err.message, 'red');
  }
}
```

### farmer-login.html — change doLogin():
```javascript
async function doLogin() {
  const mobile = document.getElementById('login-mobile').value.trim();
  const pass   = document.getElementById('login-pass').value;
  // ... your existing validation ...

  try {
    await AuthAPI.login(mobile, pass);
    showToast('✅ Login successful!', 'green');
    setTimeout(() => window.location.href = 'farmer-dashboard.html', 1500);
  } catch (err) {
    showToast('❌ ' + err.message, 'red');
  }
}
```

### All protected pages — replace localStorage guard:
```javascript
// DELETE this old guard:
if (localStorage.getItem('loggedIn') !== 'true') { window.location.href = 'farmer-login.html'; }

// REPLACE with:
Guards.requireLogin();
```

### apply-scheme.html — change apply button:
```javascript
async function submitApplication() {
  try {
    const result = await ApplicationAPI.submit({
      schemeId:    selectedSchemeId,
      schemeName:  selectedSchemeName,
      schemeAmount: selectedSchemeAmount,
      farmerNote:  document.getElementById('farmerNote').value,
    });
    showToast('✅ Applied! ID: ' + result.application.appId, 'green');
  } catch (err) {
    showToast('❌ ' + err.message, 'red');
  }
}
```

### tracking.html — load real applications:
```javascript
window.addEventListener('DOMContentLoaded', async () => {
  Guards.requireLogin();
  try {
    const apps = await ApplicationAPI.getMyApplications();
    renderApplications(apps); // your existing render function
  } catch (err) {
    showAPIError(err);
  }
});
```

### notifications.html — load real notifications:
```javascript
window.addEventListener('DOMContentLoaded', async () => {
  Guards.requireLogin();
  try {
    const { notifications } = await NotifyAPI.getAll();
    renderNotifications(notifications); // your existing render function
  } catch (err) {
    showAPIError(err);
  }
});
```

### edit-profile.html — save to backend:
```javascript
// Replace savePersonal() save line:
const result = await FarmerAPI.updatePersonal({ name, category, district, taluka, village, pincode });

// Replace saveFarm() save line:
const result = await FarmerAPI.updateFarm({ landSize, landType, mainCrop, irrigation, hasCattle, cattleCount });

// Replace saveBank() save line:
const result = await FarmerAPI.updateBank({ bankName, accountHolder, accountNumber, ifscCode });

// Replace savePassword():
await FarmerAPI.changePassword(currentPassword, newPassword);
```

---

## ✅ API Reference (all endpoints)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register farmer |
| POST | `/api/auth/login` | Public | Login with password |
| POST | `/api/auth/send-otp` | Public | Send OTP to mobile |
| POST | `/api/auth/verify-otp` | Public | Verify OTP & login |
| GET  | `/api/auth/me` | Farmer | Get current farmer |
| POST | `/api/auth/authority/login` | Public | Authority login |
| GET  | `/api/farmer/profile` | Farmer | Get profile |
| PUT  | `/api/farmer/personal` | Farmer | Update personal details |
| PUT  | `/api/farmer/farm` | Farmer | Update farm details |
| PUT  | `/api/farmer/bank` | Farmer | Update bank details |
| PUT  | `/api/farmer/password` | Farmer | Change password |
| POST | `/api/applications` | Farmer | Submit application |
| GET  | `/api/applications/my` | Farmer | My applications |
| GET  | `/api/applications/:id` | Farmer | Single application |
| GET  | `/api/applications/all` | Authority | All applications |
| GET  | `/api/applications/stats` | Authority | Dashboard stats |
| PUT  | `/api/applications/:id/status` | Authority | Approve/Reject |
| GET  | `/api/notifications` | Farmer | Get notifications |
| PUT  | `/api/notifications/read-all` | Farmer | Mark all read |
| PUT  | `/api/notifications/:id/read` | Farmer | Mark one read |
| DELETE | `/api/notifications/:id` | Farmer | Delete one |

---

## ✅ Add Real OTP (optional)
1. Sign up free at https://www.fast2sms.com
2. Get your API key from dashboard
3. Add to `.env`: `FAST2SMS_API_KEY=your_key_here`
4. Restart server — OTP now sends to real mobile numbers!

---

## 🚀 Deploy to Production (optional later)
- **Backend**: Railway.app or Render.com (free tier, drag & drop)
- **Frontend**: Netlify (drag & drop your pages folder)
- Update `API_BASE` in `api.js` to your Railway/Render URL
