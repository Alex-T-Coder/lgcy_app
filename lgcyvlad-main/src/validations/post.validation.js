const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPost = {
  files: Joi.array().items(Joi.object()).min(1).max(10).required(),
  body: Joi.object().keys({
    location: Joi.string().allow(''),
    description: Joi.string().allow(''),
    scheduleDate: Joi.string(),
    liking: Joi.boolean(),
    commenting: Joi.boolean(),
    twitter: Joi.boolean(),
    share: Joi.object().keys({
      users: Joi.array().items(Joi.string().custom(objectId)),
      timelines: Joi.array().items(Joi.string().custom(objectId)),
    }),
  }),
};

const getPosts = {
  query: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    timeline: Joi.string().custom(objectId),
  }),
};

const getPrivate = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  })
};

const getPost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const updatePost = {
  params: Joi.object().keys({
    postId: Joi.required().custom(objectId),
  }),
  files: Joi.array().items(Joi.object()).min(1).max(10),
  body: Joi.object().keys({
    location: Joi.string(),
    description: Joi.string(),
    scheduleDate: Joi.string(),
    liking: Joi.boolean(),
    commenting: Joi.boolean(),
    twitter: Joi.boolean(),
    share: Joi.object().keys({
      users: Joi.array().items(Joi.string().custom(objectId)),
      timelines: Joi.array().items(Joi.string().custom(objectId)),
    }),
  }),
};

const deletePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const getHomePost = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const likeToggle = {
  params: Joi.object({
    postId: Joi.string().required(),
  }),
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
