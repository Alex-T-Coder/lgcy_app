const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { chatService, authService } = require('../services');

const createChat = catchAsync(async (req, res) => {
  console.log('Inside Controller chat:', req.body);
  const chat = await chatService.createChat(req.body, req.headers.authorization);
  res.status(httpStatus.CREATED).send(chat);
});

const uploadChatFile = catchAsync(async (req, res) => {
  const post = await chatService.uploadChatFile(req.file);
  res.status(httpStatus.CREATED).send(post);
});

const getChats = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await chatService.queryChats(filter, options, req?.headers?.authorization);
  res.send(result);
});

const getAllUserWithPhone = catchAsync(async (req, res) => {
  const result = await chatService.getAllUserWithPhone(req.body.phoneNumbers);
  res.send(result);
});

const getChat = catchAsync(async (req, res) => {
  const chat = await chatService.getChatById(req.params.chatId);
  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat not found');
  }
  res.send(chat);
});

const updateChatMessageToSeen = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const chat = await chatService.updateChatMessageToSeen(req.params.chatId, req.body, userId);
  res.status(httpStatus.OK).send();
});

const getChatAgainstUser = catchAsync(async (req, res) => {
  const options = pick(req.query, ['userId']);
  const chat = await chatService.getChatByUserId(options.userId, req.headers.authorization);
  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat not found');
  }
  res.send(chat);
});

const deleteChat = catchAsync(async (req, res) => {
  await chatService.deleteChatById(req.params.chatId, req.headers.authorization);
  res.status(httpStatus.NO_CONTENT).send();
});

const blockChat = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.chatId;
  const blocker = await chatService.blockChat(userId, chatId);
  res.status(httpStatus.OK).send({blocker});
})

module.exports = {
  createChat,
  getChats,
  updateChatMessageToSeen,
  getChat,
  deleteChat,
  uploadChatFile,
  getAllUserWithPhone,
  getChatAgainstUser,
  blockChat
};
