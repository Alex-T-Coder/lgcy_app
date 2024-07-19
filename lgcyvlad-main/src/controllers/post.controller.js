const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { postService, authService } = require('../services');

const createPost = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const post = await postService.createPost(req.body, req.files, userId);
  res.status(httpStatus.CREATED).send(post);
});

const getPosts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'timeline']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await postService.queryPosts(filter, { ...options, populate: [
    'creator',
    'share.users',
    'share.timelines',
    'likes'
  ] });
  res.send(result);
});

const getPrivate = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'timeline']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const creator = req.params.userId;
  const user = req.user.id;
  const result = await postService.getPrivate(creator, user, { ...options, populate: [
    'creator',
    'share.users',
    'share.timelines',
    'likes'
  ] });
  res.status(httpStatus.OK).send(result);
})

const getPost = catchAsync(async (req, res) => {
  const post = await postService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.send(post);
});

const updatePost = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const post = await postService.updatePostById(req.params.postId, req.body, req.files, userId);
  res.send(post);
});

const deletePost = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  await postService.deletePostById(req.params.postId, userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getHomePost = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const homePosts = await postService.getHomePost(options, req.headers.authorization);
  res.send(homePosts);
});

const likeToggle = async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
    const result = await postService.likeToggle(req.params.postId, userId);
    res.status(httpStatus.OK).send(result);
  
};

module.exports = {
  createPost,
  getPosts,
  getPrivate,
  getPost,
  updatePost,
  deletePost,
  getHomePost,
  likeToggle,
};
