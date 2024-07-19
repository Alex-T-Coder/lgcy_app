const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, authService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  let filter;
  if (req.query.search) {
    filter = {
      $or: [
        { username: { $regex: `.*${req.query.search}.*` } },
        { name: { $regex: `.*${req.query.search}.*` } },
        { email: { $regex: `.*${req.query.search}.*` } },
      ],
    };
  } else {
    filter = pick(req.query, ['name', 'role']);
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body, req.file);
  res.send(user);
});

const updateUserProfile = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const user = await userService.updateUserProfile(userId, req.body, req.file);
  res.send(user);
});

const followerUser = catchAsync(async (req, res) => {
  const user = await userService.followerUserById(req.params.userId, req.body.isFollowing, req.user._id);
  res.send(user);
});

const updateAPNSUser = catchAsync(async (req, res) => {
  const user = await userService.updateAPNSUser(req.params.userId, req.body);
  res.send(user);
});

const updateUserPassword = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const user = await userService.updateUserPasswordById(userId, req.body);
  res.send(user);
});

const updateUserPhone = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const user = await userService.updateUserPhoneById(userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  followerUser,
  updateUserProfile,
  updateUserPassword,
  updateUserPhone,
  updateAPNSUser,
};
