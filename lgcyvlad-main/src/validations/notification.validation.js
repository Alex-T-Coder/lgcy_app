const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createNotification = Joi.object().keys({
  type: Joi.string().required(),
  from: Joi.string().custom(objectId).required(),
  to: Joi.string().custom(objectId),
  data: Joi.object()
    .keys({
      users: Joi.array().items(Joi.string().custom(objectId)),
      timelines: Joi.array().items(Joi.string().custom(objectId)),
      posts: Joi.array().items(Joi.string().custom(objectId)),
    })
    .min(1),
});

const getNotifications = {
  query: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

const updateNotification = {
  params: Joi.object().keys({
    notificationId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    type: Joi.string(),
    from: Joi.string().custom(objectId),
    to: Joi.string().custom(objectId),
    data: Joi.object()
      .keys({
        users: Joi.array().items(Joi.string().custom(objectId)),
        timelines: Joi.array().items(Joi.string().custom(objectId)),
        notifications: Joi.array().items(Joi.string().custom(objectId)),
      })
      .min(1),
  }),
};

const makeAsReadNotification = {
  params: Joi.object().keys({
    notificationId: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    read: Joi.boolean().required()
  })
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createNotification,
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  makeAsReadNotification
};
