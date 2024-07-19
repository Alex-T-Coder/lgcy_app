const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const generateOtp = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, otp, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    otp,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type, otp) => {
  const payload = jwt.verify(token, config.jwt.secret);
  let tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false, otp });
  if (otp === undefined) {
    tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  }
  if (!tokenDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  const otp = await generateOtp();
  await saveToken(refreshToken, otp, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  const otp = await generateOtp();
  await saveToken(resetPasswordToken, otp, user.id, expires, tokenTypes.RESET_PASSWORD);
  return otp;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  const otp = await generateOtp();
  await saveToken(verifyEmailToken, otp, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return otp;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateOtp,
};
