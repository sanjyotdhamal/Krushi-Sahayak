// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  let statusCode = err.statusCode || 500;
  let msg        = err.message    || 'Server error';

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const labels = { mobile:'Mobile number', aadhaar:'Aadhaar number', farmerId:'Farmer ID' };
    msg = `${labels[field] || field} already registered.`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    msg = Object.values(err.errors).map(e => e.message).join('. ');
    statusCode = 400;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    msg = 'Invalid token. Please login again.';
    statusCode = 401;
  }

  res.status(statusCode).json({ success: false, msg });
};

module.exports = errorHandler;
