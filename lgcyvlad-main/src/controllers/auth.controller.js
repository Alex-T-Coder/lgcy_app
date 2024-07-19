const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password, req.body.otp);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailOtp = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailOtp);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.body.token, req.body.otp);
  res.status(httpStatus.NO_CONTENT).send();
});

const checkAvailability = catchAsync(async (req, res) => {
  const isExists = await userService.isExists(req.body.email, req.body.username, req.body.phonenumber);

  res.send({ isAvailable: !isExists });
});

const sendOtpToPhone = catchAsync(async (req, res) => {
  const response = await authService.sendOtpToPhone(req.body.phoneNumber);
  res.status(httpStatus.OK).send({ msg: 'Otp Send to your Register Phone Number', id: response, isAvailable: true });
});

const verifyOTP = catchAsync(async (req, res) => {
  const response = await authService.verifyOTP(req.body.phoneNumber, req.body.otp);
  res.status(httpStatus.OK).send({ msg: 'Phone Number Verified', id: response.otp, isAvailable: true });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  checkAvailability,
  sendOtpToPhone,
  verifyOTP,
};
