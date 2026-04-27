const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let statusCode = 500;
  let message = 'Server Error';
  let errors = [];

  // Validation errors
  if (err.name === 'ValidationError') {
    errors = Object.values(err.errors).map(val => ({ msg: val.message, param: val.path }));
  } 
  // Mongoose duplicate key
  else if (err.code === 11000) {
    message = 'Duplicate field value entered';
  }
  // Multer file errors
  else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Max 10MB';
  } else if (err.message.includes('Only pdf') || err.message.includes('Invalid file type')) {
    statusCode = 400;
    message = err.message;
  }
  // JSON parse
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON';
  }
  // JWT
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else {
    message = err.message || 'Server Error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length && { errors })
  });
};

module.exports = errorHandler;
