const httpStatus = require('http-status');
const IO = require('socket.io');
const http = require('http');
const path = require('path');
const app = require('../app');

const httpServer = http.createServer(app);
const socketIO = IO(httpServer, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e8
});
const { Notification, Chat } = require('../models');
const { notificationTypes } = require('../config/status');
const socketValidate = require('../middlewares/socket.validate');
const { createNotification } = require('../validations/notification.validation');
const { createChat } = require('../validations/chat.validation');
const { getUserIdFromToken } = require('./auth.service');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { getUserById } = require('./user.service');
const { uploadBase64Image } = require('../controllers/file.controller');
const validateSocketData = require('../utils/socketValidate');
const chatValidation = require('../validations/chat.validation');
const { chatService } = require('.');
const { makeNotification } = require('./notification.service');

socketIO.use(async (socket, next) => {
  try {
    const token = socket.handshake.headers.authorization;
    if (!token) {
      throw new Error('Token is missing');
    }
    const userId = getUserIdFromToken(token);
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User is not registered with the provided token');
    }
    Object.assign(socket, { userId: user.id, username: user.username });
    next();
  } catch (error) {
    logger.error('Error in socket authentication: ' + error.message);
    next(new Error());
  }
});

socketIO.on('connection', (socket) => {
  logger.info('Connected to socket server', socket.id);

  socket.join(socket.userId);
  socket.on('create notification', async ({ type, data, to }) => {
    const creator = socket.userId;
    for (let i = 0; i < to.length; i += 1) {
      const notificationData = {
        type: notificationTypes[type],
        data,
        to: to[i],
        from: creator,
      };
      const notification = socketValidate(notificationData, createNotification);
      try {
        Notification.create(notification);
        // TODO:  change socketIO to soket
        socketIO.to(socket.userId).emit('send notification', notification);
      } catch (error) {
        throw new ApiError('Error: ', error);
      }
    }
  });

  socket.on('createChat', async (data) => {
    const { receiver, sender, messages } = data;
    const chat = await validateSocketData(chatValidation.createChat, data, chatService.createChat);
    if (!!chat) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      console.log('lastMessage', lastMessage);
      socketIO.to(receiver).emit('messages', lastMessage);
      // makeNotification(notificationTypes.MSG, sender, {_id: receiver}, messages.text);
    }
  });
});

const sendSocketClient = (type, to, data) => {
  socketIO.to(to.toString()).emit(type, data);
}

module.exports = {
  httpServer,
  socketIO,
  sendSocketClient
};
