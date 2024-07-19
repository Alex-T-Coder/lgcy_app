const httpStatus = require('http-status');
const Joi = require('joi');
const authService = require('./auth.service');
const ApiError = require('../utils/ApiError');
const { Notification, User, Post, Timeline, Comment } = require('../models');
const { sendNotification } = require('./apns.service');
const { objectId } = require('../validations/custom.validation');
const { notificationTypes } = require('../config/status');

/**
 *
 * @param {NotificationType} type
 * @param {ObjectId(User)} user
 * @param {ObjectId(Post, Timeline, User)} dataId
 * @param {String} data // for message and comment
 */
const makeNotification = async (type, user, typedData, data = null) => {
  let from;
  let to;
  let title;
  let notificationData = {};
  let notificationMessage = {
    text: '',
    message: '',
  };
  let tokens = [];
  const userName = (await User.findOne({ _id: user }).select('username')).username;
  switch (type) {
    // Public for notification
    // Commented to a post
    case notificationTypes.COMMENT:
      from = user;
      to = [(await Post.findOne({ _id: typedData._id }).select('creator')).creator];
      tokens = [(await User.findOne({ _id: to[0] }).select('pushToken')).pushToken];
      notificationMessage.text = `${userName} commented on your post`;
      notificationMessage.message = data;
      notificationData = {
        posts: [typedData._id],
      };
      title = 'New Comment Created';
      break;
    // Private for notification
    // Sent a message
    case notificationTypes.MSG:
      from = user;
      to = [typedData._id];
      tokens = [(await User.findOne({ _id: typedData._id }).select('pushToken')).pushToken];
      notificationMessage.text = `${userName} message you`;
      notificationMessage.message = data;
      notificationData = {
        users: [typedData._id],
      };
      title = 'New Message';
      break;
    // Public for notification
    // Liked a post
    case notificationTypes.LIKE:
      from = user;
      to = [(await Post.findOne({ _id: typedData._id }).select('creator')).creator];
      tokens = [(await User.findOne({ _id: to[0] }).select('pushToken')).pushToken];
      notificationMessage.text = `${userName} liked your post`;
      notificationData = {
        posts: [typedData._id],
      };
      title = 'Post Liked';
      break;
    // Public for notification
    // Like a comment
    case notificationTypes.LIKECOMMENT:
      from = user;
      const comment = await Comment.findOne({ _id: typedData._id }).select('user post');
      to = [comment.user];
      tokens = [(await User.findOne({ _id: to[0] }).select('pushToken')).pushToken];
      notificationMessage.text = `${userName} liked your comment`;
      notificationData = {
        posts: [comment.post],
      };
      title = 'Comment Liked';
      break;
    // Private for notification
    // Created a POST for private timelines
    case notificationTypes.POST:
      from = user;
      const { users, timelines } = (await Post.findOne({ _id: typedData._id }).select('share')).share;
      const toUsers = new Set();
      for (const toUser of users) {
        toUsers.add(toUser.toString());
      }
      for (const timeline of timelines) {
        const followers = (await Timeline.findOne({ _id: timeline }).select('followers')).followers;
        for (const follower of followers) {
          toUsers.add(follower.toString());
        }
      }

      to = Array.from(toUsers);
      tokens = to.map(async (toUserId) => (await User.findOne({ _id: toUserId }).select('pushToken')).pushToken);
      notificationMessage.text = `${userName} share a post`;
      notificationData = {
        posts: [typedData._id],
      };
      title = 'New Post Created';
      break;
    // Public for notification
    // Followed the timeline
    case notificationTypes.TIMELINE:
      from = user;
      to = [(await Timeline.findOne({ _id: typedData._id }).select('creator')).creator];
      tokens = [(await User.findOne({ _id: to[0] }).select('pushToken')).pushToken];
      notificationMessage.text = `${userName} followed your timeline`;
      notificationData = {
        timelines: [typedData._id],
      };
      title = 'Follwed Timeline';
      break;
    default:
      break;
  }

  sendNotification(title, notificationMessage.text, { type, data: typedData }, tokens);

  for (const item of to) {
    const notification = new Notification({
      type: type,
      from: from,
      to: item,
      data: notificationData,
    });
    await notification.save();
  }
};

const updateNotification = async (isFollowed, post, timeline, comment, user, otherUser, postLike, message) => {
  let title = '';
  let body = '';
  let tokens = [];
  let payload = post;

  let type = '';
  let from = '';
  let data = {};
  let to = [];
  if (user != null) {
    const users = await User.findOne({ _id: user.id }).populate('followers', 'id pushToken');
    tokens = await users.followers.map((follower) => follower.pushToken ?? '');
    to = await users.followers.map((follower) => follower.id ?? '');
  }
  console.log(to);
  if (timeline != null) {
    type = 'timeline';
    from = user.id;
    data = { timeline: timeline.id };
    title = `New Timeline Created`;
    body = `Your friend ${user.name} created new timeline ${timeline.title}`;
    payload = timeline;
  } else if (post != null) {
    type = 'post';
    from = user.id;
    data = { posts: post.id };
    title = `New Post Created`;
    body = `Your friend ${user.name} posted new post`;
    payload = post;
  }
  if (comment === true) {
    type = 'comment';
    from = user.id;
    data = { comment: post.id };
    title = `New Comment Created`;
    body = `Your friend ${otherUser.name} commented on your post`;
    payload = post;
    tokens = [otherUser.pushToken];
    to = [otherUser.id];
  }
  if (postLike === true) {
    type = 'liked';
    from = user.id;
    data = { comment: post.id };
    title = `Post Liked`;
    body = `Your friend ${user.name} liked your post`;
    payload = post;
    tokens = [otherUser.pushToken];
    to = [otherUser.id];
  }
  if (message != null) {
    type = 'message';
    from = user.id;
    data = { message: message.id };
    title = `new Message`;
    body = `Your friend ${user.name} send you a message ${message.text}`;
    payload = message;
    tokens = [otherUser.pushToken];
    to = [otherUser.id];
  }
  if (isFollowed) {
    type = 'followed';
    from = user.id;
    data = { message: message.id };
    title = `New Follower`;
    body = `${otherUser.name} Followed you`;
    payload = otherUser;
    tokens = [otherUser.pushToken];
    to = [otherUser.id];
  }
  const rest = await sendNotification(title, body, { type, data: payload }, tokens);
  console.log(rest);
  for (const item of to) {
    const notification = new Notification({
      type: type,
      from: from,
      to: item,
      data: data,
    });
    await notification.save();
  }
};

const createNotification = async (notificationBody, authorization) => {
  const { to, type, data } = notificationBody;

  const userId = await authService.getUserIdFromToken(authorization);

  const notification = new Notification({
    from: userId,
    to,
    type,
    data,
  });
  return notification.save();
};

/**
 * Query for posts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryNotifications = async (filter, options) => {
  const notifications = await Notification.paginate(filter, options);
  return notifications;
};

/**
 * Get post by id
 * @param {ObjectId} id
 * @returns {Promise<Notification>}
 */

const getNotificationById = async (id) => {
  return Notification.findById(id);
};

/**
 * Update notification by id
 * @param {ObjectId} notificationId
 * @param {Object} updateBody
 * @returns {Promise<Notification>}
 */
const updateNotificationById = async (notificationId, updateBody, authorization) => {
  const userId = await authService.getUserIdFromToken(authorization);

  // Find the notification and update it
  const notification = await Notification.findByIdAndUpdate(notificationId, updateBody, { new: true });

  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  // Ensure the user updating the notification is the same as the one who created it
  if (!notification.from.equals(userId)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authorized to update this notification');
  }

  // Return the updated notification
  return notification;
};

/** s
 * Delete notification by id
 * @param {ObjectId} notificationId
 * @returns {Promise<Notification>}
 */

const deleteNotificationById = async (notificationId, authorization) => {
  const userId = await authService.getUserIdFromToken(authorization);

  // Find the notification
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error('Notification not found');
  }

  // Ensure the user deleting the notification is the same as the one who created it
  if (!notification.from.equals(userId)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authorized to delete this notification');
  }

  // Delete the notification
  await notification.remove();
};

const getUnreadNotifications = async (userId) => {
  const notifications = await Notification.find({ to: userId, status: false });
  return notifications.length;
};

const makeRead = async (notificationId, read) => {
  await Notification.findOneAndUpdate({ _id: notificationId }, { status: read });
  return read;
};

const makeReadAll = async (userId) => {
  await Notification.updateMany({ to: userId }, { status: true});
  return true;
}

module.exports = {
  makeNotification,
  createNotification,
  queryNotifications,
  getNotificationById,
  updateNotificationById,
  deleteNotificationById,
  updateNotification,
  getUnreadNotifications,
  makeRead,
  makeReadAll
};
