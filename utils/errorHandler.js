const winston = require("winston");

const errorHandler = (err, req, res, next) => {
  // Log the error details using winston (for better error logging in production)
  winston.error(err.message, { stack: err.stack });

  // Set status and message based on the error
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  // Send a response with the error details
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }), // Include stack trace in non-production environments
  });
};

module.exports = errorHandler;
