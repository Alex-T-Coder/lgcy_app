const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    phoneNumber: Joi.string(),
    birthday: Joi.string(),
    username: Joi.string(),
    description: Joi.string(),
    link: Joi.string(),
    notification: Joi.boolean(),
    directMessage: Joi.boolean(),
    role: Joi.string().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
    search: Joi.string(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  file: Joi.object().required(),
  body: Joi.object().keys({
    email: Joi.string().email(),
    password: Joi.string().custom(password),
    name: Joi.string(),
    phoneNumber: Joi.string(),
    birthday: Joi.string(),
    username: Joi.string(),
    description: Joi.string(),
    link: Joi.string(),
    directMessage: Joi.boolean(),
    role: Joi.string().valid('user', 'admin'),
  }),
};


const updateUserPassword = {
  body: Joi.object().keys({
    newPassword: Joi.string().required().custom(password),
    currentPassword: Joi.string().required().custom(password),
  }),
};

const updateUserPhone = {
  body: Joi.object().keys({
    newPhone: Joi.string().required(),
    currentPhone: Joi.string().required(),
  }),
};

const sendOtpToPhone = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required(),
  }),
};

const verifyOtp = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required(),
    otp: Joi.string().required(),
  }),
};

const updateUserProfile = {
  file: Joi.object().optional(),
  body: Joi.object().keys({
    email: Joi.string().email(),
    password: Joi.string().custom(password),
    name: Joi.string(),
    phoneNumber: Joi.string(),
    birthday: Joi.string(),
    username: Joi.string(),
    description: Joi.string(),
    link: Joi.string(),
    directMessage: Joi.boolean(),
    role: Joi.string().valid('user', 'admin'),
  }),
};

const updateAPNSUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      token: Joi.string(),
    })
    .min(1),
};

const followerUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      isFollowing: Joi.boolean()
    }),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  followerUser,
  updateUserProfile,
  updateUserPhone,
  updateUserPassword,
  updateAPNSUser,
  sendOtpToPhone,
  verifyOtp,
};
