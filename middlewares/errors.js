const ErrorHandler = require("../Utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV == "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errorMessage: err.message,
      stack: err.stack,
    });
  }
  if (process.env.NODE_ENV == "PRODUCTION") {
    let error = { ...err };
    error.message = err.message;

    //Wrong mongoose id error
    if (err.name === "CastError") {
      const message = `Resource not found,Invalid ${err.path}`;
      error = new ErrorHandler(message, 400);
    }

    //Handling Mongoose validation error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((value) => value.message);
      error = new ErrorHandler(message, 400);
    }

    //Handling Mongoose duplicate key errors
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
      error = new ErrorHandler(message, 400);
    }
    if (err.name === "JsonWebTokenError") {
      const message = "Json Web Token is invalid. Try Again!!!";
      error = new ErrorHandler(message, 400);
    }
    if (err.name === "TokenExpiredError") {
      const message = "Json Web Token is Expired. Try Again!!!";
      error = new ErrorHandler(message, 400);
    }
    res.status(err.statusCode).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
