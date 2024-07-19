const httpStatus = require('http-status');
const storageService = require('./storage.service');
const { Timeline, User, Notification } = require('../models');
const ApiError = require('../utils/ApiError');
const { sendNotification } = require('./apns.service');
const { updateNotification, makeNotification } = require('./notification.service');
const { notificationTypes } = require('../config/status');

const createTimeline = async (timelineBody, postFile, userId) => {
  // if (postFile === undefined) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Please upload a file!');
  // }

  const coverImage = { coverImage: null };
  if (postFile) {
    const [uploadedFile] = await storageService.uploadFiles([postFile]);
    coverImage.coverImage = {
      real: uploadedFile.originalName,
      url: uploadedFile.url,
      key: uploadedFile.key,
    };
  }  

  const creator = { creator: userId };
  const timeline = await Timeline.create({ ...coverImage, ...timelineBody, ...creator });
  await User.addTimeline(userId, timeline._id);

  const user = await User.findById(userId);
  // if (user != null) {
  //   updateNotification(false, null, timeline, null, user, null, false, null);
  // }
  return timeline;
};

/**
 * Query for timelines
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTimelines = async (filter, options) => {
  const timelines = await Timeline.paginate(filter, {
    ...options,
    populate: 'followers,creator.id.name.image.descrption.username',
  });
  return timelines;
};

/**
 * Get timeline by Creator
 * @param {ObjectId} id
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<void>}
 */
const getTimelineByCreator = async (userId, filter, options) => {
  try {
    const homePost = await Timeline.paginate(
      { creator: userId, ...filter },
      { ...options, populate: 'creator.id.name.description.image.username,followers' }
    );
    // console.log(homePost);
    return {
      results: homePost?.results,
      page: homePost?.page,
      limit: homePost?.limit,
      totalPages: homePost?.totalPages,
      totalResults: homePost?.totalResults,
    };
  } catch (e) {
    throw new ApiError(e);
  }
};

/**
 * Get timeline by id
 * @param {ObjectId} id
 * @returns {Promise<Timeline>}
 */
const getTimelineById = async (id) => {
  return Timeline.findById(id)
    .populate({ path: 'followers' })
    .populate({ path: 'creator', select: 'id name description image username' });
};

/**
 * Update timeline by id
 * @param {ObjectId} timelineId
 * @param {Object} updateBody
 * @param {Express.Multer.File} updateFile
 * @param {string} userId
 * @returns {Promise<Timeline>}
 */
const updateTimelineById = async (timelineId, updateBody, updateFile, userId) => {
  const creator = { creator: userId };
  const timeline = await getTimelineById(timelineId);
  if (!timeline) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Timeline not found');
  }
  let coverImage = {};
  if (updateFile !== undefined) {
    const [uploadedFile] = await storageService.uploadFiles([updateFile]);

    // remove previous user image
    await storageService.deleteFiles([timeline.coverImage.key]);

    coverImage = {
      coverImage: {
        real: uploadedFile.originalName,
        url: uploadedFile.url,
        key: uploadedFile.key,
      },
    };
  }

  Object.assign(timeline, { ...coverImage, ...updateBody, ...creator });
  await timeline.save();
  return timeline;
};

/**
 * Delete timeline by id
 * @param {ObjectId} timelineId
 * @param {string} userId
 * @returns {Promise<Timeline>}
 */
const deleteTimelineById = async (timelineId, userId) => {
  const timeline = await getTimelineById(timelineId);
  if (!timeline) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Timeline not found');
  }

  await User.removeTimeline(userId, timeline?._id);
  await timeline.remove();
  if (timeline.toObject().coverImage) {
    await storageService.deleteFiles([timeline.toObject().coverImage.key]);
  }
  return true;
};

/**
 * Follow user to the timeline
 * @param {*} timelineId  timeline id
 * @param {*} userId  user id
 */
const follow = async (timelineId, userId) => {
  const timeline = await Timeline.findById(timelineId);

  if (!timeline) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Timeline not found');
  }

  if (timeline.creator.toString() === userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'The creator cannot follow his own timeline');
  }

  await Timeline.addFollower(timelineId, userId);
  await User.addTimelineFollowing(userId, timelineId);
  makeNotification(notificationTypes.TIMELINE, userId, timeline);
};

/**
 * Unfollow user from the timeline
 * @param {*} timelineId timeline id
 * @param {*} userId user id
 */
const unfollow = async (timelineId, userId) => {
  await User.removeTimelineFollowing(userId, timelineId);
  await Timeline.removeFollower(timelineId, userId);
};

module.exports = {
  follow,
  unfollow,
  createTimeline,
  queryTimelines,
  getTimelineById,
  updateTimelineById,
  deleteTimelineById,
  getTimelineByCreator,
};
