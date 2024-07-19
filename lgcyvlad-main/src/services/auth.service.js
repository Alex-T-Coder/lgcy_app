const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const { messageId } = require('aws-sdk/clients/sns');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const config = require('../config/config');
const { OtpModel } = require('../models');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email or password is incorrect');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @param {string} otp
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword, otp) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD, otp);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken, otp) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL, otp);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'user not found');
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Get userId
 * @param {string} authorization
 * @returns {Promise<String>}
 */
const getUserIdFromToken = (authorization) => {
  const authToken = authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(authToken, config.jwt.secret);
    return decoded.sub;
  } catch (e) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'unauthorized');
  }
};

/**
 * Get userId
 * @param {string} mobileNumber
 * @returns {Promise<String>}
 */
const sendOtpToPhone = async (mobileNumber) => {
  console.log('inside send otp');
  console.log('access key : ' + config.bucket.accessKey),
    console.log('access key : ' + config.bucket.secretKey),
    console.log('access key : ' + config.bucket.region),
    AWS.config.update({
      accessKeyId: config.bucket.accessKey,
      secretAccessKey: config.bucket.secretKey,
      region: config.bucket.region, // e.g., 'us-east-1'
    });
  const sns = new AWS.SNS();
  const otp = Math.floor(1000 + Math.random() * 9000);
  const params = {
    Message: `Your LGCY Phone Verification OTP is ${otp}`, // Message containing the OTP
    PhoneNumber: mobileNumber, // Mobile number to send OTP
  };
  try {
    const data = await sns.publish(params).promise();
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 2);
    const otpModel = new OtpModel({ phoneNumber: mobileNumber, otp, expirationDate: currentDate });
    await otpModel.save();
    return data.MessageId;
  } catch (err) {
    console.error('Error sending OTP:', err);
    throw err; // Rethrow the error for the caller to handle
  }
};

const verifyOTP = async (mobileNumber, otp) => {
  const otpModel = await OtpModel.findOne({ phoneNumber: mobileNumber, otp });
  const currentDate = new Date();
  if (otpModel == null || currentDate >= otpModel.expirationDate) {
    throw new Error('OTP Not Found or Expired');
  } else {
    await otpModel.remove();
    return otpModel;
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  getUserIdFromToken,
  sendOtpToPhone,
  verifyOTP,
};
