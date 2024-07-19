const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTimeline = {
  file: Joi.object(),
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().optional().allow(""),
    link: Joi.string().optional().allow(""),
    imageType: Joi.string(),
    status: Joi.object().keys({
      value: Joi.string(),
      followerShown: Joi.boolean(),
      inviters: Joi.array().items(Joi.string().custom(objectId)),
    }),
  }),
};

const getTimelines = {
  query: Joi.object().keys({
    search: Joi.string(),
    title: Joi.string(),
    description: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCreatorTimelines = {
  query: Joi.object().keys({
    id: Joi.string(),
    title: Joi.string(),
    sortBy: Joi.string(),
    description: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};
const getCreatorIDTimelines = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    title: Joi.string(),
    description: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTimeline = {
  params: Joi.object().keys({
    timelineId: Joi.string().custom(objectId),
  }),
};

const updateTimeline = {
  params: Joi.object().keys({
    timelineId: Joi.required().custom(objectId),
  }),
  file: Joi.object().optional(),
  body: Joi.object()
    .keys({
      title: Joi.string().allow(''),
      description: Joi.string().allow(''),
      link: Joi.string().allow(''),
      status: Joi.object().keys({
        value: Joi.string(),
        followerShown: Joi.boolean(),
        inviters: Joi.array().items(Joi.string().custom(objectId)),
      }),
    })
    .min(1),
};

const deleteTimeline = {
  params: Joi.object().keys({
    timelineId: Joi.string().custom(objectId),
  }),
};

const followTimeline = {
  params: Joi.object().keys({
    timelineId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  followTimeline,
  createTimeline,
  getTimelines,
  getTimeline,
  updateTimeline,
  deleteTimeline,
  getCreatorTimelines,
  getCreatorIDTimelines,
};
