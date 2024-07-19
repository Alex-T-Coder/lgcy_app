const httpStatus = require('http-status');
const AWS = require('aws-sdk');
const { User, OtpModel } = require('../models');
const ApiError = require('../utils/ApiError');
const storageService = require('./storage.service');
const { updateNotification } = require('./notification.service');
const config = require('../config/config');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (await User.isUsernameTaken(userBody.username)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return {
    results: users?.results,
    page: users?.page,
    limit: users?.limit,
    totalPages: users?.totalPages,
    totalResults: users?.totalResults,
  };
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id).populate('followers posts timelines');
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody, userProfileImage) => {
  const bodyCopy = { ...updateBody };
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (bodyCopy.email && (await User.isEmailTaken(bodyCopy.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (bodyCopy.username && (await User.isUsernameTaken(bodyCopy.username, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }

  if (userProfileImage) {
    const [uploadedFile] = await storageService.uploadFiles([userProfileImage]);

    // remove previous user image
    await storageService.deleteFiles([user.image?.key]);

    bodyCopy.image = {
      real: uploadedFile.originalName,
      url: uploadedFile.url,
      key: uploadedFile.key,
    };
  }
  Object.assign(user, bodyCopy);
  await user.save();
  return user;
};

/**
 * Update user profile
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserProfile = async (userId, updateBody, userProfileImage) => {
  const bodyCopy = { ...updateBody };

  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (updateBody.username && (await User.isUsernameTaken(updateBody.username, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }
  if (userProfileImage) {
    const [uploadedFile] = await storageService.uploadFiles([userProfileImage]);
    // remove previous user image
    if (user.image) {
      await storageService.deleteFiles([user.image.key]);
    }

    bodyCopy.image = {
      real: uploadedFile.originalName,
      url: uploadedFile.url,
      key: uploadedFile.key,
    };
  }
  Object.assign(user, bodyCopy);
  await user.save();
  return user;
};

/**
 * Update follower user by id
 * @param {ObjectId} userId
 * @param {Bool} isFollowing
 * @returns {Promise<User>}
 */
const followerUserById = async (userId, isFollowing, senderId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  let updatedUser;
  if (isFollowing) {
    updatedUser = await User.follower(user, senderId, null);
    // const otherUser = await User.findById(updateBody.follow);
    // updateNotification(updateBody.follow != null, null, null, null, user, otherUser, false, null);
  } else {
    updatedUser = await User.follower(user, null, senderId);
  }

  return updatedUser || user;
};

/**
 * Update follower user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateAPNSUser = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  Object.assign(user, { pushToken: updateBody.token });
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const updateUserPasswordById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  Object.assign(user, { password: updateBody.newPassword });
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const updateUserPhoneById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  Object.assign(user, { phoneNumber: updateBody.newPhone });
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Check if user exists
 * @param {string} email
 * @param {string} username
 * @param {string} phoneNumber
 * @returns {Promise<Boolean>}
 */
const isExists = async (email, username, phoneNumber) => {
  return User.exists({ email, username, phoneNumber }, { ignoreUndefined: true });
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  followerUserById,
  updateUserProfile,
  isExists,
  updateUserPhoneById,
  updateUserPasswordById,
  updateAPNSUser,
};
