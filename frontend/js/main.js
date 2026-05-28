/* ═══════════════════════════════════════════════════════════════
   KRUSHI SAHAYAK — main.js  (shared backend for all pages)
   Location in project: js/main.js
   All pages in /pages/ load this as: <script src="../js/main.js">
═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────
// ROUTES — all page filenames (all in /pages/)
// ─────────────────────────────────────────────────
const ROUTES = {
  home:          'index.html',
  login:         'farmer-login.html',
  register:      'farmer-register.html',
  dashboard:     'farmer-dashboard.html',
  schemes:       'schemes.html',
  aiRecommend:   'ai-recommendation.html',
  apply:         'apply-scheme.html',
  tracking:      'tracking.html',
  notifications: 'notifications.html',
  authority:     'authority-dashboard.html',
};

// ─────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────
const Auth = {

  isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
  },

  // Returns the full farmer object saved by farmer-register.html
  getFarmer() {
    const raw = localStorage.getItem('farmerData');
    return raw ? JSON.parse(raw) : null;
  },

  // Password login — validates against stored farmerData
  login(mobile, password) {
    const farmer = this.getFarmer();
    if (!farmer)
      return { ok: false, msg: 'No account found. Please register first.' };
    if (String(farmer.mobile) !== String(mobile).trim())
      return { ok: false, msg: 'Mobile number does not match our records.' };
    if (farmer.password !== password)
      return { ok: false, msg: 'Incorrect password. Please try again.' };
    this._setSession();
    return { ok: true };
  },

  // OTP login — demo OTP is always 1234
  loginOTP(mobile, otp) {
    const farmer = this.getFarmer();
    if (!farmer)
      return { ok: false, msg: 'No account found. Please register first.' };
    if (String(farmer.mobile) !== String(mobile).trim())
      return { ok: false, msg: 'Mobile number does not match our records.' };
    if (String(otp) !== '1234')
      return { ok: false, msg: 'Incorrect OTP. Demo OTP is 1234.' };
    this._setSession();
    return { ok: true };
  },

  _setSession() {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('loginTime', Date.now());
  },

  logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('loginTime');
    window.location.href = ROUTES.login;
  },

  // Call at top of every protected page
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = ROUTES.login;
      return false;
    }
    return true;
  },

  // Call on login page — skip if already in
  redirectIfLoggedIn() {
    if (this.isLoggedIn())
      window.location.href = ROUTES.dashboard;
  },

  // Authority
  authorityLogin(user, pass) {
    if (user === 'admin' && pass === 'admin123') {
      localStorage.setItem('authorityLoggedIn', 'true');
      return { ok: true };
    }
    return { ok: false, msg: 'Invalid authority credentials.' };
  },
  isAuthorityLoggedIn() { return localStorage.getItem('authorityLoggedIn') === 'true'; },
  authorityLogout() {
    localStorage.removeItem('authorityLoggedIn');
    window.location.href = ROUTES.home;
  },
};

// ─────────────────────────────────────────────────
// FARMER DATA — normalises field names from register
// Register saves: mainCrop, landSize, farmerId, bankName, irrigation
// Dashboard reads via this helper — no field-name bugs
// ─────────────────────────────────────────────────
const FarmerData = {
  get() {
    const d = Auth.getFarmer() || {};
    return {
      // identity
      name:          d.name          || '—',
      mobile:        d.mobile        || '—',
      aadhaar:       d.aadhaar       || '—',
      category:      d.category      || '—',
      // address
      district:      d.district      || '—',
      taluka:        d.taluka        || '—',
      village:       d.village       || '—',
      pincode:       d.pincode       || '—',
      // farm  ← fix: register saves landSize / mainCrop / irrigation
      landSize:      d.landSize      || d.land  || '—',
      landType:      d.landType      || '—',
      mainCrop:      d.mainCrop      || d.crop  || '—',
      irrigation:    d.irrigation    || d.water || '—',
      hasCattle:     d.hasCattle     || 'no',
      cattleCount:   d.cattleCount   || '0',
      // bank
      bankName:      d.bankName      || d.bank  || '—',
      accountHolder: d.accountHolder || '—',
      accountNumber: d.accountNumber || '—',
      ifscCode:      d.ifscCode      || '—',
      // id  ← register saves farmerId, not id
      farmerId:      d.farmerId      || d.id    || 'KS-2024-00000',
      registeredOn:  d.registeredOn  || '—',
    };
  },
};

// ─────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────
const AppData = {
  getAll() {
    return JSON.parse(localStorage.getItem('applications') || '[]');
  },
  save(app) {
    const list = this.getAll();
    const newApp = {
      ...app,
      id:          'KS-APP-2024-' + String(list.length + 1).padStart(3, '0'),
      appliedOn:   new Date().toLocaleDateString('en-IN'),
      status:      'submitted',
      statusHistory: [{
        status: 'submitted',
        date:   new Date().toLocaleDateString('en-IN'),
        note:   'Application submitted successfully',
      }],
    };
    list.push(newApp);
    localStorage.setItem('applications', JSON.stringify(list));
    Notify.add({
      title:    'Application Submitted ✅',
      title_mr: 'अर्ज सबमिट झाला ✅',
      msg:      `Your application for "${app.schemeName}" was submitted. ID: ${newApp.id}`,
      msg_mr:   `"${app.schemeName}" साठी अर्ज सबमिट झाला. आयडी: ${newApp.id}`,
      type:     'success',
    });
    return newApp;
  },
  getById(id) { return this.getAll().find(a => a.id === id) || null; },
  updateStatus(id, status, note) {
    const list = this.getAll();
    const i    = list.findIndex(a => a.id === id);
    if (i === -1) return false;
    list[i].status = status;
    list[i].statusHistory.push({ status, note, date: new Date().toLocaleDateString('en-IN') });
    localStorage.setItem('applications', JSON.stringify(list));
    Notify.add({
      title: 'Application Updated',
      title_mr: 'अर्ज अपडेट झाला',
      msg: `Application ${id} is now: ${status}. ${note || ''}`,
      msg_mr: `अर्ज ${id} स्थिती: ${status}.`,
      type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
    });
    return true;
  },
  statusLabel(s, lang) {
    const m = {
      submitted:    { en:'Submitted',     mr:'सबमिट केला'   },
      under_review: { en:'Under Review',  mr:'समीक्षाधीन'    },
      approved:     { en:'Approved ✅',   mr:'मंजूर ✅'      },
      rejected:     { en:'Rejected ❌',   mr:'नाकारला ❌'    },
      pending_docs: { en:'Docs Pending',  mr:'कागदपत्रे बाकी'},
    };
    return (m[s] && m[s][lang || 'en']) || s;
  },
  statusColor(s) {
    return { submitted:'#1a7a3c', under_review:'#e8650a',
             approved:'#25a050',  rejected:'#e53935', pending_docs:'#f0a500' }[s] || '#888';
  },
};

// ─────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────
const Notify = {
  getAll() { return JSON.parse(localStorage.getItem('notifications') || '[]'); },
  add(n) {
    const list = this.getAll();
    list.unshift({ ...n, id: Date.now(), read: false,
      time: new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
      date: new Date().toLocaleDateString('en-IN') });
    localStorage.setItem('notifications', JSON.stringify(list.slice(0, 50)));
    this._badge();
  },
  markRead(id) {
    const list = this.getAll().map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('notifications', JSON.stringify(list));
    this._badge();
  },
  markAllRead() {
    const list = this.getAll().map(n => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(list));
    this._badge();
  },
  unreadCount() { return this.getAll().filter(n => !n.read).length; },
  _badge() {
    const el = document.getElementById('notifBadge');
    const c  = this.unreadCount();
    if (el) { el.textContent = c; el.style.display = c > 0 ? 'flex' : 'none'; }
  },
  seedDemo() {
    if (this.getAll().length > 0) return;
    this.add({ title:'Welcome to Krushi Sahayak! 🌾', title_mr:'कृषी सहायकमध्ये स्वागत! 🌾',
      msg:'You are now registered. Start exploring schemes.',
      msg_mr:'तुमची नोंदणी झाली. योजना पाहण्यास सुरुवात करा.', type:'success' });
    this.add({ title:'PM Kisan 18th Installment Open', title_mr:'पीएम किसान १८वा हप्ता सुरू',
      msg:'Apply now before 31 March 2025.',
      msg_mr:'३१ मार्च २०२५ पूर्वी अर्ज करा.', type:'info' });
    this.add({ title:'Keep Documents Ready 📄', title_mr:'कागदपत्रे तयार ठेवा 📄',
      msg:'Keep your 7/12, Aadhaar and bank passbook handy.',
      msg_mr:'७/१२, आधार आणि बँक पासबुक तयार ठेवा.', type:'warning' });
  },
};

// ─────────────────────────────────────────────────
// SCHEMES DATA
// ─────────────────────────────────────────────────
const Schemes = {
  all: [
    { id:'S001', name:'Drip Irrigation Subsidy',   name_mr:'ठिबक सिंचन अनुदान',       amount:'₹80,000',    cat:'irrigation', crops:['all'], minLand:0.5, dept:'Water Resources',  deadline:'31 Mar 2025', desc:'50% subsidy on drip irrigation system.', desc_mr:'ठिबक सिंचन यंत्रणेवर ५०% अनुदान.' },
    { id:'S002', name:'Tractor Subsidy Scheme',     name_mr:'ट्रॅक्टर अनुदान योजना',  amount:'₹1,50,000',  cat:'machinery',  crops:['all'], minLand:2,   dept:'Agriculture',      deadline:'30 Jun 2025', desc:'Subsidy on new tractor for small farmers.', desc_mr:'लहान शेतकऱ्यांना ट्रॅक्टरवर अनुदान.' },
    { id:'S003', name:'Solar Pump Scheme',          name_mr:'सौर पंप योजना',            amount:'₹2,20,000',  cat:'energy',     crops:['all'], minLand:1,   dept:'MSEDCL',           deadline:'31 Dec 2024', desc:'Solar pump subsidy for irrigation.', desc_mr:'सिंचनासाठी सौर पंप अनुदान.' },
    { id:'S004', name:'Farm Pond Scheme',           name_mr:'शेत तलाव योजना',           amount:'₹75,000',    cat:'water',      crops:['all'], minLand:1,   dept:'Water Conservation',deadline:'28 Feb 2025', desc:'Aid for farm pond construction.', desc_mr:'शेत तलाव बांधणीसाठी मदत.' },
    { id:'S005', name:'Cattle Shed Subsidy',        name_mr:'गोठा बांधणी अनुदान',       amount:'₹70,000',    cat:'animal',     crops:['all'], minLand:0,   dept:'Animal Husbandry', deadline:'31 Mar 2025', desc:'Subsidy for cattle shed construction.', desc_mr:'गोठा बांधणीसाठी अनुदान.' },
    { id:'S006', name:'PM Kisan Samman Nidhi',      name_mr:'पीएम किसान सन्मान निधी',   amount:'₹6,000/yr',  cat:'income',     crops:['all'], minLand:0,   dept:'Central Govt.',    deadline:'Ongoing',     desc:'₹6,000 annual income support in 3 installments.', desc_mr:'वार्षिक ₹6,000 उत्पन्न आधार ३ हप्त्यांत.' },
    { id:'S007', name:'Cotton Crop Insurance',      name_mr:'कापूस पीक विमा',            amount:'₹25,000',    cat:'insurance',  crops:['cotton'],   minLand:0.5, dept:'Agriculture Insurance', deadline:'31 Jul 2025', desc:'PMFBY for cotton farmers.', desc_mr:'कापूस शेतकऱ्यांसाठी पीएम फसल बिमा.' },
    { id:'S008', name:'Soybean Seed Subsidy',       name_mr:'सोयाबीन बियाणे अनुदान',    amount:'₹5,000',     cat:'seed',       crops:['soybean'],  minLand:0.5, dept:'Agriculture',  deadline:'30 Jun 2025', desc:'Certified soybean seed at subsidised rate.', desc_mr:'प्रमाणित सोयाबीन बियाणे सवलतीच्या दराने.' },
    { id:'S009', name:'Sugarcane Development',      name_mr:'ऊस विकास कार्यक्रम',       amount:'₹15,000',    cat:'crop',       crops:['sugarcane'],minLand:1,   dept:'Sugar Commissioner',deadline:'30 Sep 2025', desc:'Subsidy for sugarcane improvement.', desc_mr:'उसाच्या वाण सुधारणेसाठी अनुदान.' },
    { id:'S010', name:'Soil Health Card Scheme',    name_mr:'मृद आरोग्य कार्ड योजना',   amount:'Free',       cat:'soil',       crops:['all'], minLand:0,   dept:'Agriculture',      deadline:'Ongoing',     desc:'Free soil testing and fertilizer guidance.', desc_mr:'मोफत माती परीक्षण आणि खत मार्गदर्शन.' },
  ],
  recommend(farmer) {
    if (!farmer) return this.all.slice(0, 4);
    const land = parseFloat(farmer.landSize) || 0;
    const crop = (farmer.mainCrop || '').toLowerCase();
    return this.all.filter(s =>
      (s.crops.includes('all') || s.crops.includes(crop)) && land >= s.minLand
    );
  },
  getById(id) { return this.all.find(s => s.id === id); },
};

// ─────────────────────────────────────────────────
// LANGUAGE (persists across pages)
// ─────────────────────────────────────────────────
const Lang = {
  current: localStorage.getItem('ks_lang') || 'en',
  set(lang) {
    this.current = lang;
    localStorage.setItem('ks_lang', lang);
    document.body.classList.toggle('mr', lang === 'mr');
    document.querySelectorAll('[data-en]').forEach(el => {
      if (el.children.length === 0)
        el.textContent = lang === 'mr' ? (el.dataset.mr || el.dataset.en) : el.dataset.en;
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active',
        (lang === 'mr' && btn.textContent.includes('मराठी')) ||
        (lang === 'en' && btn.textContent.trim() === 'EN')
      );
    });
  },
  init() { if (this.current === 'mr') this.set('mr'); },
};

// ─────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────
const Utils = {
  toast(msg, type) {
    const colours = { success:'#1a7a3c', error:'#e53935', info:'#1565c0', warning:'#e8650a' };
    let t = document.getElementById('_ks_toast');
    if (!t) {
      t = document.createElement('div'); t.id = '_ks_toast';
      Object.assign(t.style, {
        position:'fixed', bottom:'90px', left:'50%', transform:'translateX(-50%)',
        color:'#fff', padding:'12px 26px', borderRadius:'50px',
        fontFamily:"'Baloo 2',sans-serif", fontWeight:'700', fontSize:'0.9rem',
        boxShadow:'0 6px 24px rgba(0,0,0,0.2)', zIndex:'99999',
        transition:'opacity 0.35s', whiteSpace:'nowrap', pointerEvents:'none',
      });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = colours[type] || colours.info;
    t.style.opacity = '1';
    clearTimeout(t._hide);
    t._hide = setTimeout(() => t.style.opacity = '0', 3000);
  },
  go(key) { window.location.href = ROUTES[key] || key; },
  maskAadhaar(n) { return 'XXXX XXXX ' + String(n).replace(/\s/g,'').slice(-4); },
  maskAccount(n) { return 'XXXXXXXX' + String(n).slice(-4); },
};

// ─────────────────────────────────────────────────
// AUTO-INIT ON EVERY PAGE LOAD
// ─────────────────────────────────────────────────

// ── Helper: update the "My Applications" sidebar badge ──
async function _ks_updateAppBadge() {
  try {
    // Only run if ApplicationAPI is available (api.js loaded) and farmer is logged in
    if (typeof ApplicationAPI === 'undefined' || !Auth.isLoggedIn()) return;
    const apps = await ApplicationAPI.getMyApplications();
    const count = apps ? apps.length : 0;
    // Update every .ni-badge inside any nav-item linking to tracking.html
    document.querySelectorAll('.nav-item[href="tracking.html"] .ni-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });
  } catch (_) { /* server offline — leave badge as-is */ }
}

// ── Helper: update the "Notifications" sidebar badge from real unread count ──
async function _ks_updateNotifBadge() {
  try {
    let unread = 0;
    if (typeof NotifyAPI !== 'undefined' && Auth.isLoggedIn()) {
      // Try real backend first
      const notifs = await NotifyAPI.getAll();
      unread = notifs.filter(n => !n.isRead).length;
    } else {
      // Fall back to localStorage Notify
      unread = Notify.unreadCount();
    }
    document.querySelectorAll('.nav-item[href="notifications.html"] .ni-badge').forEach(el => {
      el.textContent = unread;
      el.style.display = unread > 0 ? '' : 'none';
    });
  } catch (_) {
    // Fallback to localStorage count
    const unread = Notify.unreadCount();
    document.querySelectorAll('.nav-item[href="notifications.html"] .ni-badge').forEach(el => {
      el.textContent = unread;
      el.style.display = unread > 0 ? '' : 'none';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  Lang.init();
  Notify._badge();
  if (Auth.isLoggedIn()) {
    Notify.seedDemo();
    // Dynamically update sidebar badges from real data on every page
    _ks_updateNotifBadge();
    _ks_updateAppBadge();
  }
});

// Expose globally
window.KS = { Auth, FarmerData, AppData, Notify, Schemes, Lang, Utils, ROUTES };