const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createChat = {
  messages: Joi.object().keys({
    receiver: Joi.string().custom(objectId).required(),
    sender: Joi.string().custom(objectId).required(),
    text: Joi.string().allow(''),
    image: Joi.string().allow(null),

    file: Joi.object().allow(null),
  }),
  receiver: Joi.string().custom(objectId).required(),
  sender: Joi.string().custom(objectId).required(),
};

const updateChatMessageToSeen = {
  params: Joi.object().keys({
    chatId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    messageId: Joi.string().custom(objectId).required(),
  }),
};

const uploadFileChat = Joi.object().keys({
  file: Joi.string(),
});

const getAllUserWithPhone = {
  body: Joi.object().keys({
    phoneNumbers: Joi.array().items(Joi.string().replace(/\D/g, '')),
  }),
};

const getChats = {
  query: Joi.object().keys({
    receiver: Joi.string().custom(objectId),
    sender: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getChat = {
  params: Joi.object().keys({
    chatId: Joi.string().custom(objectId),
  }),
};
const getAgainstChat = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const deleteChat = {
  params: Joi.object().keys({
    chatId: Joi.string().custom(objectId),
  }),
};

const blockChat = {
  params: Joi.object().keys({
    chatId: Joi.string().custom(objectId)
  })
}

module.exports = {
  createChat,
  getChats,
  getChat,
  deleteChat,
  uploadFileChat,
  getAllUserWithPhone,
  updateChatMessageToSeen,
  getAgainstChat,
  blockChat
};
