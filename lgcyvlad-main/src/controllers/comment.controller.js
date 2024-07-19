const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { commentService, authService } = require('../services');

// Controller function to like a post
// const likePost = catchAsync(async (req, res) => {
//   const post = await postService.likePost(req.params.postId, req.user._id);
//   res.status(httpStatus.OK).send(post);
// });

// Controller function to add a comment to a post
const addComment = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const comment = await commentService.addComment(req.params.postId, req.body.content, userId);
  res.status(httpStatus.CREATED).send(comment);
});

const getComments = catchAsync(async (req, res) => {
  const comments = await commentService.getComments(req.params.postId);
  res.status(httpStatus.OK).send(comments);
});

const addReply = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const reply = await commentService.addReply(req.params.commentId, req.body.content, userId);
  res.status(httpStatus.CREATED).send(reply);
});

const deleteComment = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const deleteComment = await commentService.deleteComment(req.params.commentId, userId);
  res.status(httpStatus.NO_CONTENT).send(deleteComment);
});

const deleteReply = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  await commentService.deleteReply(req.params.commentId, req.params.replyId, userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const likeComment = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await commentService.likeComment(req.params.commentId, userId);
  res.status(httpStatus.OK).send(result);
})

module.exports = {
  addComment,
  getComments,
  addReply,
  deleteComment,
  deleteReply,
  likeComment,
};
