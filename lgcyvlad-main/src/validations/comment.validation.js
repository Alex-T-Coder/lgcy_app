const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addComment = {
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }),
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    content: Joi.string().required(),
  }),
};

const getComments = {
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }),
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const addReply = {
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }),
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    content: Joi.string().required(),
  }),
};

const deleteComment = {
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }),
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId).required(),
  }),
};

const deleteReply = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId).required(),
    replyId: Joi.string().custom(objectId).required(),
  }),
};

const likeComment = {
  params: Joi.object({
    commentId: Joi.string().required(),
  }),
}

// const updateComment = {
//   headers: Joi.object().keys({
//     authorization: Joi.string().required(),
//   }),
//   params: Joi.object().keys({
//     commentId: Joi.string().custom(objectId).required(),
//   }),
//   body: Joi.object().keys({
//     content: Joi.string().required(),
//   }),
// };

// const deleteComment = {
//   headers: Joi.object().keys({
//     authorization: Joi.string().required(),
//   }),
//   params: Joi.object().keys({
//     commentId: Joi.string().custom(objectId).required(),
//   }),
// };

// const addReplyToComment = {
//   headers: Joi.object().keys({
//     authorization: Joi.string().required(),
//   }),
//   params: Joi.object().keys({
//     parentCommentId: Joi.string().custom(objectId).required(),
//   }),
//   body: Joi.object().keys({
//     content: Joi.string().required(),
//   }),
// };

// const deleteReply = {
//   headers: Joi.object().keys({
//     authorization: Joi.string().required(),
//   }),
//   params: Joi.object().keys({
//     parentCommentId: Joi.string().custom(objectId).required(),
//     replyId: Joi.string().custom(objectId).required(),
//   }),
// };

// const updateReply = {
//   headers: Joi.object().keys({
//     authorization: Joi.string().required(),
//   }),
//   params: Joi.object().keys({
//     parentCommentId: Joi.string().custom(objectId).required(),
//     replyId: Joi.string().custom(objectId).required(),
//   }),
//   body: Joi.object().keys({
//     content: Joi.string().required(),
//   }),
// };

module.exports = {
  addComment,
  getComments,
  addReply,
  deleteComment,
  deleteReply,
  likeComment
};
