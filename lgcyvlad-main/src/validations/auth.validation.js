const Joi = require('joi');
const { password, name } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().custom(name),
    phoneNumber: Joi.string().required(),
    username: Joi.string().required().custom(name),
    birthday: Joi.string(),
    description: Joi.string(),
    link: Joi.string(),
    notification: Joi.boolean(),
    directMessage: Joi.boolean(),
    role: Joi.string().valid('user', 'admin').default('user'),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    otp: Joi.string().required(),
    password: Joi.string().required().custom(password),
    token: Joi.string().required(),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    otp: Joi.string().required(),
    token: Joi.string().required(),
  }),
};

const checkAvailability = {
  body: Joi.object().keys({
    email: Joi.string(),
    username: Joi.string(),
    phoneNumber: Joi.string(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  checkAvailability,
};
