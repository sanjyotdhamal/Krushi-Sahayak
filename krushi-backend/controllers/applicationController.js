// controllers/applicationController.js
const Application  = require('../models/Application');
const Notification = require('../models/Notification');

// ══════════════════════════════════════════════
// @route  POST /api/applications
// @desc   Submit new scheme application
// @access Private (farmer)
// ══════════════════════════════════════════════
exports.submitApplication = async (req, res, next) => {
  try {
    console.log('📝 Application submission received');
    console.log('  Farmer ID:', req.farmer ? req.farmer._id : 'NO FARMER');
    console.log('  Farmer Name:', req.farmer ? req.farmer.name : 'NONE');
    
    const { schemeId, schemeName, schemeAmount, schemeDept, farmerNote } = req.body;
    console.log('  Scheme:', schemeId, schemeName);

    if (!schemeId || !schemeName) {
      return res.status(400).json({ success: false, msg: 'Scheme ID and name are required.' });
    }

    // Check if already applied for this scheme
    const existing = await Application.findOne({
      farmer: req.farmer._id,
      schemeId,
      status: { $nin: ['rejected'] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        msg: `You have already applied for "${schemeName}". Application ID: ${existing.appId}`,
      });
    }

    const app = await Application.create({
      farmer:       req.farmer._id,
      farmerId:     req.farmer.farmerId,
      farmerName:   req.farmer.name,
      schemeId,
      schemeName,
      schemeAmount,
      schemeDept,
      farmerNote,
    });

    console.log('✅ Application saved to DB:', app.appId);

    // Notify farmer
    await Notification.create({
      farmer:   req.farmer._id,
      title:    'Application Submitted ✅',
      title_mr: 'अर्ज सबमिट झाला ✅',
      msg:      `Your application for "${schemeName}" has been submitted. ID: ${app.appId}`,
      msg_mr:   `"${schemeName}" साठी अर्ज सबमिट झाला. आयडी: ${app.appId}`,
      type:     'success',
      link:     'tracking.html',
    });

    res.status(201).json({ success: true, msg: 'Application submitted successfully!', application: app });
  } catch (err) {
    console.error('❌ Application submission error:', err.message);
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  GET /api/applications/my
// @desc   Get all applications of logged-in farmer
// @access Private (farmer)
// ══════════════════════════════════════════════
exports.getMyApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ farmer: req.farmer._id })
      .sort({ appliedOn: -1 });

    res.json({ success: true, count: apps.length, applications: apps });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  GET /api/applications/:id
// @desc   Get single application details
// @access Private (farmer — own application only)
// ══════════════════════════════════════════════
exports.getApplication = async (req, res, next) => {
  try {
    const app = await Application.findOne({
      _id:    req.params.id,
      farmer: req.farmer._id,
    });
    if (!app) {
      return res.status(404).json({ success: false, msg: 'Application not found.' });
    }
    res.json({ success: true, application: app });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  GET /api/applications/all  (AUTHORITY)
// @desc   Get ALL applications (admin view)
// @access Private (authority)
// ══════════════════════════════════════════════
exports.getAllApplications = async (req, res, next) => {
  try {
    const { status, schemeId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (schemeId) filter.schemeId = schemeId;

    const total = await Application.countDocuments(filter);
    const apps  = await Application.find(filter)
      .sort({ appliedOn: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('farmer', 'name mobile district village farmerId');

    res.json({ success: true, total, page: parseInt(page), count: apps.length, applications: apps });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  PUT /api/applications/:id/status  (AUTHORITY)
// @desc   Update application status
// @access Private (authority)
// ══════════════════════════════════════════════
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note, disbursedAmount } = req.body;
    const validStatuses = ['submitted','under_review','pending_docs','approved','rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, msg: 'Invalid status value.' });
    }

    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, msg: 'Application not found.' });
    }

    app.status = status;
    app.statusHistory.push({ status, note: note || '', updatedBy: 'authority', date: new Date() });
    if (status === 'approved') {
      app.approvedOn      = new Date();
      app.disbursedAmount = disbursedAmount || 0;
      app.disbursedOn     = disbursedAmount ? new Date() : undefined;
    }
    if (status === 'under_review') app.reviewedOn = new Date();
    await app.save();

    // Notify farmer
    const msgs = {
      under_review: { en: `Your application ${app.appId} is now under review.`,         mr: `अर्ज ${app.appId} समीक्षाधीन आहे.` },
      pending_docs: { en: `Documents required for ${app.appId}. ${note || ''}`,          mr: `${app.appId} साठी कागदपत्रे आवश्यक. ${note || ''}` },
      approved:     { en: `🎉 Application ${app.appId} APPROVED! Amount: ${disbursedAmount ? '₹'+disbursedAmount : app.schemeAmount}`, mr: `🎉 अर्ज ${app.appId} मंजूर! रक्कम: ${disbursedAmount ? '₹'+disbursedAmount : app.schemeAmount}` },
      rejected:     { en: `Application ${app.appId} was rejected. Reason: ${note || 'Not specified'}`, mr: `अर्ज ${app.appId} नाकारला. कारण: ${note || 'सांगितले नाही'}` },
    };

    const notifMsg = msgs[status];
    if (notifMsg) {
      await Notification.create({
        farmer:   app.farmer,
        title:    `Application ${status.replace('_',' ').toUpperCase()}`,
        title_mr: `अर्ज ${status === 'approved' ? 'मंजूर' : status === 'rejected' ? 'नाकारला' : 'अपडेट'}`,
        msg:      notifMsg.en,
        msg_mr:   notifMsg.mr,
        type:     status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
        link:     'tracking.html',
      });
    }

    res.json({ success: true, msg: `Status updated to "${status}".`, application: app });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  GET /api/applications/stats  (AUTHORITY)
// @desc   Get dashboard stats for authority
// @access Private (authority)
// ══════════════════════════════════════════════
exports.getStats = async (req, res, next) => {
  try {
    const [total, submitted, under_review, approved, rejected, pending_docs] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: 'submitted' }),
      Application.countDocuments({ status: 'under_review' }),
      Application.countDocuments({ status: 'approved' }),
      Application.countDocuments({ status: 'rejected' }),
      Application.countDocuments({ status: 'pending_docs' }),
    ]);

    const Farmer = require('../models/Farmer');
    const totalFarmers = await Farmer.countDocuments();

    res.json({
      success: true,
      stats: { total, submitted, under_review, approved, rejected, pending_docs, totalFarmers },
    });
  } catch (err) {
    next(err);
  }
};
