/* ═══════════════════════════════════════════════════════════════
   KRUSHI SAHAYAK — api.js
   Location: js/api.js   (same folder as main.js)
   All pages include: <script src="../js/api.js"></script>

   Replaces localStorage with real MongoDB backend calls.
   Token is stored in localStorage('ks_token').
═══════════════════════════════════════════════════════════════ */

const API_BASE = 'http://localhost:5000/api';  // ← change to your server URL when deployed

// ─────────────────────────────────────────────────
// CORE FETCH HELPER
// ─────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('ks_token');

  const config = {
    method:  options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body) config.body = JSON.stringify(options.body);

  try {
    // Log ALL requests (not just authority)
    console.log(`[API FETCH] ${config.method} ${endpoint}`, {
      hasAuthToken: !!token,
      tokenStart: token ? token.substring(0, 20) + '...' : 'NONE',
      hasCustomAuth: !!options.headers?.Authorization,
      finalAuth: config.headers.Authorization ? 'Bearer ' + config.headers.Authorization.substring(7, 27) + '...' : 'NONE',
      hasBody: !!options.body
    });

    const res  = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();

    console.log(`[API RESPONSE] ${config.method} ${endpoint}`, {
      status: res.status,
      success: data.success,
      message: data.msg || data.message
    });

    if (!res.ok) {
      throw new Error(data.msg || `Error ${res.status}`);
    }
    return data;

  } catch (err) {
    console.error(`[API ERROR] ${config.method} ${endpoint}`, err);
    // Network error — server not running
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Make sure backend is running on port 5000.');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────
const AuthAPI = {

  // Register new farmer
  async register(formData) {
    const data = await apiFetch('/auth/register', { method: 'POST', body: formData });
    this._saveSession(data);
    return data;
  },

  // Login with mobile + password
  async login(mobile, password) {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { mobile, password } });
    this._saveSession(data);
    return data;
  },

  // Send OTP to mobile
  async sendOTP(mobile) {
    return await apiFetch('/auth/send-otp', { method: 'POST', body: { mobile } });
  },

  // Verify OTP and login
  async verifyOTP(mobile, otp) {
    const data = await apiFetch('/auth/verify-otp', { method: 'POST', body: { mobile, otp } });
    this._saveSession(data);
    return data;
  },

  // Authority login
  async authorityLogin(username, password) {
    const data = await apiFetch('/auth/authority/login', { method: 'POST', body: { username, password } });
    sessionStorage.setItem('ks_authority_token', data.token);
    sessionStorage.setItem('authorityLoggedIn', 'true');
    return data;
  },

  // Save token + farmer data to localStorage (mirrors old structure for compatibility)
  _saveSession(data) {
    localStorage.setItem('ks_token',   data.token);
    localStorage.setItem('loggedIn',   'true');
    localStorage.setItem('loginTime',  Date.now());
    // Save farmerData in same format old pages expect
    localStorage.setItem('farmerData', JSON.stringify(data.farmer));
  },

  logout() {
    localStorage.removeItem('ks_token');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('farmerData');
    window.location.href = 'farmer-login.html';
  },

  isLoggedIn() {
    return !!localStorage.getItem('ks_token') && localStorage.getItem('loggedIn') === 'true';
  },

  getFarmer() {
    const raw = localStorage.getItem('farmerData');
    return raw ? JSON.parse(raw) : null;
  },

  getToken() {
    return localStorage.getItem('ks_token');
  },
};

// ─────────────────────────────────────────────────
// FARMER API
// ─────────────────────────────────────────────────
const FarmerAPI = {

  async getProfile() {
    const data = await apiFetch('/farmer/profile');
    // Keep localStorage in sync
    localStorage.setItem('farmerData', JSON.stringify(data.farmer));
    return data.farmer;
  },

  async updatePersonal(payload) {
    const data = await apiFetch('/farmer/personal', { method: 'PUT', body: payload });
    localStorage.setItem('farmerData', JSON.stringify(data.farmer));
    return data;
  },

  async updateFarm(payload) {
    const data = await apiFetch('/farmer/farm', { method: 'PUT', body: payload });
    localStorage.setItem('farmerData', JSON.stringify(data.farmer));
    return data;
  },

  async updateBank(payload) {
    const data = await apiFetch('/farmer/bank', { method: 'PUT', body: payload });
    localStorage.setItem('farmerData', JSON.stringify(data.farmer));
    return data;
  },

  async changePassword(currentPassword, newPassword) {
    return await apiFetch('/farmer/password', { method: 'PUT', body: { currentPassword, newPassword } });
  },
};

// ─────────────────────────────────────────────────
// APPLICATIONS API
// ─────────────────────────────────────────────────
const ApplicationAPI = {

  async submit(schemeData) {
    return await apiFetch('/applications', { method: 'POST', body: schemeData });
  },

  async getMyApplications() {
    const data = await apiFetch('/applications/my');
    // Sync to localStorage so tracking.html still works
    localStorage.setItem('applications', JSON.stringify(data.applications));
    return data.applications;
  },

  async getOne(id) {
    const data = await apiFetch(`/applications/${id}`);
    return data.application;
  },

  // Authority only
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await apiFetch(`/applications/all${query ? '?' + query : ''}`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('ks_authority_token')}` },
    });
  },

  async updateStatus(id, status, note, disbursedAmount) {
    return await apiFetch(`/applications/${id}/status`, {
      method: 'PUT',
      body:   { status, note, disbursedAmount },
      headers: { Authorization: `Bearer ${sessionStorage.getItem('ks_authority_token')}` },
    });
  },

  async getStats() {
    return await apiFetch('/applications/stats', {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('ks_authority_token')}` },
    });
  },
};

// ─────────────────────────────────────────────────
// NOTIFICATIONS API
// ─────────────────────────────────────────────────
const NotifyAPI = {

  async getAll() {
    const data = await apiFetch('/notifications');
    this._updateBadge(data.unread);
    return data;
  },

  async markRead(id) {
    await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllRead() {
    await apiFetch('/notifications/read-all', { method: 'PUT' });
    this._updateBadge(0);
  },

  async deleteOne(id) {
    await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
  },

  _updateBadge(count) {
    const el = document.getElementById('notifBadge');
    if (el) { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; }
  },
};

// ─────────────────────────────────────────────────
// PAGE GUARDS — call these at the top of each page
// ─────────────────────────────────────────────────
const Guards = {

  // For protected pages (dashboard, schemes, apply, etc.)
  requireLogin() {
    if (!AuthAPI.isLoggedIn()) {
      window.location.href = 'farmer-login.html';
      return false;
    }
    return true;
  },

  // For login/register pages — skip if already logged in
  redirectIfLoggedIn() {
    if (AuthAPI.isLoggedIn()) {
      window.location.href = 'farmer-dashboard.html';
    }
  },

  requireAuthority() {
    if (sessionStorage.getItem('authorityLoggedIn') !== 'true') {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },
};

// ─────────────────────────────────────────────────
// GLOBAL ERROR DISPLAY
// Show a friendly error toast for any API failure
// ─────────────────────────────────────────────────
function showAPIError(err) {
  const msg = err.message || 'Something went wrong. Please try again.';
  // Use KS.Utils.toast if main.js is loaded, else fallback
  if (window.KS && KS.Utils) {
    KS.Utils.toast('❌ ' + msg, 'error');
  } else {
    alert(msg);
  }
}

// ─────────────────────────────────────────────────
// AUTO REFRESH unread notification badge on load
// ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (AuthAPI.isLoggedIn()) {
    try {
      const data = await NotifyAPI.getAll();
      NotifyAPI._updateBadge(data.unread);
    } catch (_) {
      // Silently fail — badge just won't update
    }
  }
});

// Expose globally
window.AuthAPI        = AuthAPI;
window.FarmerAPI      = FarmerAPI;
window.ApplicationAPI = ApplicationAPI;
window.NotifyAPI      = NotifyAPI;
window.Guards         = Guards;
window.showAPIError   = showAPIError;