const httpStatus = require('http-status');
const { Post, Comment, User } = require('../models');
const { authService } = require('.');
const ApiError = require('../utils/ApiError');
const { notificationTypes } = require('../config/status');
const { makeNotification } = require('./notification.service');

// // Function to like a post
// const likePost = async (postId, userId) => {
//   const post = await Post.findById(postId);
//   if (!post) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
//   }

//   if (post.likes.includes(userId)) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'You have already liked this post');
//   }

//   post.likes.push(userId);
//   await post.save();

//   return post;
// };

// Function to add a comment to a post̥
const addComment = async (postId, content, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  const comment = await Comment.create({ content, user: userId, post: postId });
  makeNotification(notificationTypes.COMMENT, userId, post, content);
  post.comments.push(comment._id);
  await post.save();

  return comment;
};

const getComments = async (postId) => {
  const postComments = await Comment.find({ post: postId }).populate([
    { path: 'user', select: 'username image' },
    { path: 'likes' },
  ]);
  return postComments;
};

const addReply = async (commentId, replyContent, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  // Push the new reply object into the replies array
  comment.replies.push({
    content: replyContent,
    user: userId,
  });

  await comment.save();

  return comment;
};

const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId).populate('post');
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  const post = comment.post;
  if (post.creator.toString() !== userId || comment.user.toString() !== userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  post.comments = post.comments.filter((commentRef) => commentRef.toString() !== commentId);

  // Save the updated post
  await post.save();

  await comment.remove();
};

const deleteReply = async (commentId, replyId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  const replyIndex = comment.replies.findIndex((r) => r.id === replyId);
  if (replyIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reply not found');
  }
  const reply = comment.replies[replyIndex];
  if (reply.user.toString() !== userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  comment.replies.splice(replyIndex, 1);
  await comment.save();
};

const likeComment = async (commentId, userId) => {
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
    }

    // Check if the user has already liked the comment
    const userLiked = comment.likes.includes(userId);

    if (userLiked) {
      // Unlike the comment
      comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Like the comment
      comment.likes.push(userId);
      makeNotification(notificationTypes.LIKECOMMENT, userId, comment);
    }

    // Save the updated comment
    await comment.save();

    return { liked: !userLiked };
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
}

module.exports = {
  addComment,
  getComments,
  addReply,
  deleteComment,
  deleteReply,
  likeComment,
};
