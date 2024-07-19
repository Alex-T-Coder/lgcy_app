const httpStatus = require('http-status');

const authService = require('./auth.service');
const storageService = require('./storage.service');

const { Post, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { sendNotification } = require('./apns.service');
const { updateNotification, makeNotification } = require('./notification.service');
const { notificationTypes } = require('../config/status');

const createPost = async (postBody, postFiles, userId) => {
  if (postFiles.length <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please upload a file!');
  }

  const uploadedFiles = await storageService.uploadFiles(postFiles);

  const files = {
    files: uploadedFiles.map((file) => ({
      memeType: file.memeType,
      real: file.originalName,
      url: file.url,
      key: file.key,
    })),
  };
  const creator = { creator: userId };
  const post = await Post.create({ ...files, ...postBody, ...creator });
  await User.addPost(userId, post._id);
  // makeNotification(notificationTypes.POST, userId, post);
  // updateNotification(false, post, null, null, user, null, false, null);

  return post;
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
const queryPosts = async (filter, options) => {
  const posts = await Post.queryPosts(filter, options);
  return posts;
};

const getPrivate = async (creator, userId, options) => {
  const query = {
    $or: [
      { creator, "share.users": { $in: [userId] }},
      { creator: userId, "share.users": { $in: [creator] }}
    ]
  };
  const res = await Post.paginate(query, options);
  return {
    results: res?.results,
    page: res?.page,
    limit: res?.limit,
    totalPages: res?.totalPages,
    totalResults: res?.totalResults,
  };
};

/**
 * Get post by id
 * @param {ObjectId} id
 * @returns {Promise<Post>}
 */
const getPostById = async (id) => {
  return Post.findById(id).populate({ path: 'creator', select: 'id name image description' });
};

/**
 * Check if user is a creator
 * @param {*} post
 * @param {string} userId
 * @returns {bool}
 */
const isCreator = (post, userId) => {
  return post.creator._id.toString() === userId;
};

/**
 * Update post by id
 * @param {ObjectId} postId
 * @param {Object} updateBody
 * @param {Express.Multer.File[]} updateFiles
 * @param {string} userId
 * @returns {Promise<Post>}
 */
const updatePostById = async (postId, updateBody, updateFiles, userId) => {
  const post = await getPostById(postId);

  if (!isCreator(post, userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update post');
  }

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const uploadedFiles = await storageService.uploadFiles(updateFiles);
  const files = {
    files: [
      ...post.files,
      ...uploadedFiles.map((file) => ({
        real: file.originalName,
        url: file.url,
        key: file.key,
      })),
    ],
  };

  Object.assign(post, { ...files, ...updateBody });
  await post.save();
  return post;
};

/** s
 * Delete post by id
 * @param {ObjectId} postId
 * @param {string} userId
 * @returns {Promise<Post>}
 */
const deletePostById = async (postId, userId) => {
  const post = await getPostById(postId);

  if (!isCreator(post, userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete post');
  }

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const keys = post.toObject().files.map((file) => file.key);

  await User.removePost(userId, post?._id);
  await post.remove();
  await storageService.deleteFiles(keys);
  return true;
};

const getHomePost = async (options, authorization) => {
  let suggestedUser = [];
  const userId = await authService.getUserIdFromToken(authorization);
  const user = await User.findById(userId);
  if (!user) throw ApiError(httpStatus.BAD_GATEWAY, `No user found`);

  /**
   * This code is no longer needed and can be safely removed in the future.
   */
  // if (user?.followers) {
  //   const userFollower = user?.followers.filter((follower) => follower !== userId);
  //   suggestedUser = await User.find({
  //     _id: { $in: userFollower },
  //   }).limit(options.limit ?? 10);
  // }

  const query = {
    $and: [
      {
        $or: [
          // { creator: userId },
          {
            'share.timelines': { $in: user?.timelinesFollowing },
          },
          // { 'share.users': { $in: [userId] } },
        ],
      },
      {
        scheduleDate: { $lte: new Date() },
      },
    ],
  };
  // const homePost = await Post.paginate(query, { ...options, populate: 'creator.name.description.image.username,share,likes' });
  const homePost = await Post.paginate(query, { ...options, populate: [
    'creator',
    'share.users',
    'share.timelines',
    'likes'
  ] });
  return {
    results: homePost?.results,
    page: homePost?.page,
    limit: homePost?.limit,
    totalPages: homePost?.totalPages,
    totalResults: homePost?.totalResults,
  };
};

const likeToggle = async (postId, userId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
    }

    // Check if the user has already liked the post
    const userLiked = post.likes.includes(userId);

    if (userLiked) {
      // Unlike the post
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Like the post
      post.likes.push(userId);
      makeNotification(notificationTypes.LIKE, userId, post);
    }

    // Save the updated post
    await post.save();

    return { liked: !userLiked };
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
};

module.exports = {
  createPost,
  queryPosts,
  getPrivate,
  getPostById,
  updatePostById,
  deletePostById,
  getHomePost,
  likeToggle,
};
