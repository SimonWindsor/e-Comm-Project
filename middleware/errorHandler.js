// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database connection errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: 'Service temporarily unavailable'
    });
  }

  // PostgreSQL specific errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      error: 'Duplicate entry'
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      success: false,
      message: 'Invalid reference',
      error: 'Referenced resource does not exist'
    });
  }

  // JWT/Passport errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: 'Please log in again'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: err.message
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.path}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
