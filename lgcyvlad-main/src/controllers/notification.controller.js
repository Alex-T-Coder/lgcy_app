const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { notificationService } = require('../services');

const createNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.createNotification(req.body, req.headers.authorization);
  res.status(httpStatus.CREATED).send(notification);
});

const getNotifications = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await notificationService.queryNotifications({
    ...filter,
    to: req.user._id
  }, {
    ...options,
      populate: ['data.posts creator,likes,share.timelines,share.users', 'data.timelines creator,followers', 'data.users', 'from', 'to']
  });
  res.send(result);
});

const getNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  res.send(notification);
});

const updateNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.updateNotificationById(
    req.params.notificationId,
    req.body,
    req.headers.authorization
  );
  res.send(notification);
});

const deleteNotification = catchAsync(async (req, res) => {
  await notificationService.deleteNotificationById(req.params.notificationId, req.headers.authorization);
  res.status(httpStatus.NO_CONTENT).send();
});

const getUnreadNotifications = catchAsync(async (req, res) => {
  const counts = await notificationService.getUnreadNotifications(req.user._id);
  res.status(httpStatus.OK).send(counts.toString());
});

const makeRead = catchAsync(async (req, res) => {
  const value = await notificationService.makeRead(req.params.notificationId, req.body.read);
  res.status(httpStatus.OK).send(value.toString());
});

const makeReadAll = catchAsync(async (req, res) => {
  const value = await notificationService.makeReadAll(req.user._id);
  res.status(httpStatus.OK).send(value.toString());
});

module.exports = {
  createNotification,
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  getUnreadNotifications,
  makeRead,
  makeReadAll
};
