const User = require("../models/User");
const ErrorHandler = require("../Utils/errorHandler");
const catchasyncErrors = require("../middlewares/catchAsyncErrors");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../Utils/jwtToken");
const sendEmail = require("../Utils/sendEmail");
const crypto = require("crypto");
const cloudinary=require('cloudinary');
//register new user => api/v1/register
exports.registerUser = catchasyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  let result;
  try{
    result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: "scale"
    })
  }catch(error){
    return  next(new ErrorHandler("cloudinary error", 400));
  }
  
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });
  sendToken(user, 200, res);
});

//login users => api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  //checking if email and password is entered by the user
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email or password", 400));
  }

  //finding password in database
  const user = await User.findOne({
    email,
  }).select("+password");

  //checking if user does not exists in db
  if (!user) {
    return next(new ErrorHandler("Invalid Email or password", 401));
  }

  //checking if password is correct
  const passwordmatched = await user.comparePassword(password);

  if (!passwordmatched) {
    return next(new ErrorHandler("Invalid Email or password", 401));
  }

  sendToken(user, 200, res);
});

//forget password api/v1/password/forgot
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User does not exists."));
  }
  //generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //creating reset password url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `your password reset token is as follow :\n\n${resetUrl}\n\n ,if you 
  have not requested this mail, then Please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset your password",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});
//showing user profile => /api/v1/profile
exports.getuserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

//update user password => api/v1/password/change
exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler("Old Password is incorrect"), 400);
  }
  user.password = req.body.password;
  await user.save();

  sendToken(user, 200, res);
});

//update user profile => api/v1/profile/update
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  let result;
  try{
    result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: "scale"
    })
  }catch(error){
    return  next(new ErrorHandler("cloudinary error", 400));

  }
  
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindandModify: false,
  });
  res.status(200).json({
    success: true,
  });
});

//resetPassword /api/v1/resetPassword/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  //Hash Url token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next("password does not match", 401);
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});
//logout users api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure:true,
    sameSite:"None"
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

//Admin Routes

//get all users => api/v1/admin/users

exports.allusers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

//get userdetails /api/v1/admin/user/:id

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User does not exist ${req.params.id}`, 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//admin update user => api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindandModify: false,
  });
  res.status(200).json({
    success: true,
  });
});

//delete user /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User does not exist ${req.params.id}`, 400));
  }
  await User.findByIdAndRemove(req.params.id);
  res.status(200).json({
    success: true,
    user,
  });
});
