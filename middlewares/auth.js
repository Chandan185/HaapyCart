//This is to check authenticated users for routes

const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = await req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  next();
});

//handling roles authorization

exports.authorizeRoles = (...Roles) => {
  return (req, res, next) => {
    if (!Roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role ${req.user.role} is not allowed to access the resource`,
          403
        )
      );
    }
    next();
  };
};
