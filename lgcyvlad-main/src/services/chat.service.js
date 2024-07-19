const httpStatus = require('http-status');
const { Types } = require('mongoose');
const { authService } = require('.');
const { Chat, User, Post } = require('../models');
const ApiError = require('../utils/ApiError');
const { unlinkFile } = require('../controllers/file.controller');
const storageService = require('./storage.service');
const { updateNotification } = require('./notification.service');
const { filter } = require('../config/logger');
const { cleanPhoneNumbers } = require('../utils/helpers');

const getAllUserWithPhone = async (chatContacts) => {
  const cleanChatContacts = cleanPhoneNumbers(chatContacts);
  const regexPatterns = cleanChatContacts.map(contact => new RegExp(contact, 'i'));
  const users = await User.find({
    phoneNumber: { $in: regexPatterns },
  });
  return users;
};

const createChat = async (chatBody, authorization) => {
  const { sender } = chatBody;
  const { receiver } = chatBody;
  const oldChatFound = await Chat.findOne({
    $or: [{ $and: [{ sender: receiver }, { receiver: sender }] }, { $and: [{ sender }, { receiver }] }],
  });
  if (oldChatFound) {
    oldChatFound.messages.push(chatBody.messages);
    await oldChatFound.save();
    const newChat = await Chat.findOne({ _id: oldChatFound.id })
      .populate({ path: 'sender', select: 'id name description image' })
      .populate({ path: 'messages.sender', select: 'id name description image' })
      .populate({ path: 'messages.receiver', select: 'id name description image' })
      .populate({ path: 'receiver', select: 'id name description image' });

    const user = await User.findById(sender);
    const otherUser = await User.findById(receiver);
    // if (user != null) {
    //   updateNotification(false, null, null, null, user, otherUser, false, chatBody.messages[0]);
    // }

    return newChat;
  }
  // If no chat exists, create a new one
  const chat = await Chat.create({ ...chatBody });
  if (chat != null) {
    const newChat = await Chat.findOne({ _id: chat._id })
      .populate({ path: 'sender', select: 'id name description image' })
      .populate({ path: 'messages.sender', select: 'id name description image' })
      .populate({ path: 'messages.receiver', select: 'id name description image' })
      .populate({ path: 'receiver', select: 'id name description image' });
    return newChat;
  }
  return chat;
};

const uploadChatFile = async (updateFile) => {
  const file = await storageService.uploadFiles([updateFile]);
  const files = {
    image: {
      real: file.originalName,
      url: file.url,
      key: file.key,
    },
  };
  return files;
};

const queryChats = async (_filter, options, authorization) => {
  const userId = await authService.getUserIdFromToken(authorization);
  console.log('----userID from token----' + userId);
  const chats = await Chat.aggregate([
    {
      $match: {
        $or: [
          { sender: Types.ObjectId(userId) },
          { receiver: Types.ObjectId(userId) }
        ]
      }
    },
    {
      $addFields: {
        latestMessageCreatedAt: {
          $max: "$messages.createdAt"
        }
      }
    },
    {
      $sort: { latestMessageCreatedAt: -1 }
    },
  ]).exec();

  // Populate sender, receiver, and messages.sender
  await Chat.populate(chats, [
      { path: 'sender', select: 'id name description image username' },
      { path: 'receiver', select: 'id name description image username' },
      { path: 'messages.sender', select: 'id name description image username' }
  ]);
  return chats.filter((chat) => chat.receiver && chat.sender).map((chat) => ({ id: chat._id, ...chat }));
};
  
  

/**
 * Get chat by id
 * @param {ObjectId} id
 * @returns {Promise<Chat>}
 */
const getChatById = async (id) => {
  return Chat.findById(id);
};

/**
 * Get chat by UserId
 * @param {ObjectId} userID
 * @returns {Promise<Chat>}
 */
const getChatByUserId = async (userID, authorization) => {
  const sender = await authService.getUserIdFromToken(authorization);
  const receiver = userID;
  const oldChatFound = await Chat.findOne({
    $or: [{ $and: [{ sender: receiver }, { receiver: sender }] }, { $and: [{ sender }, { receiver }] }],
  })
    .populate({ path: 'sender', select: 'id name description image' })
    .populate({ path: 'messages.sender', select: 'id name description image' })
    .populate({ path: 'receiver', select: 'id name description image' })
    .sort({ 'messages.createdAt': -1 });
  if (oldChatFound != null) {
    for (const message of oldChatFound.messages) {
      if (message.sender === receiver && !message.isSeen) {
        message.isSeen = true;
        console.log('if condition');
      }
    }
    await oldChatFound.save();
  }

  return oldChatFound;
};

/**
 * Delete chat by id
 * @param {ObjectId} chatId
 * @returns {Promise<Chat>}
 */
const deleteChatById = async (chatId, authorization) => {
  const chat = await getChatById(chatId);
  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat not found');
  }
  const userId = await authService.getUserIdFromToken(authorization);
  console.log(chat);

  chat?.messages.forEach((msg) => {
    unlinkFile(userId, msg.file?.real);
  });

  //do not find any real use of this method hence for nows disabling.
  //await User.removeChat(userId, chat?._id);
  await Chat.deleteOne();
  return true;
};

// write a service function that would update the isSeen attribute of chat message to true
const updateChatMessageToSeen = async (chatId, messageBody, userId) => {
  const { messageId } = messageBody;
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat not found');
  }
  const message = chat.messages.id(messageId);
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }
  if (message.receiver.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this message');
  }
  message.isSeen = true;
  await chat.save();
  return chat;
};

const blockChat = async (userId, chatId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Chat not found');
    }

    if (chat.blocker) {
      chat.blocker = null;
    } else {
      chat.blocker = userId
    }
    await chat.save();

    return chat.blocker;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
}

module.exports = {
  createChat,
  getChatById,
  deleteChatById,
  updateChatMessageToSeen,
  queryChats,
  uploadChatFile,
  getAllUserWithPhone,
  getChatByUserId,
  blockChat
};
