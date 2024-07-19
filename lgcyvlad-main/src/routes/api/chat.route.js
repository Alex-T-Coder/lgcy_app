const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const chatValidation = require('../../validations/chat.validation');
const chatController = require('../../controllers/chat.controller');
const fileController = require('../../controllers/file.controller');
const router = express.Router();

router
  .route('/getAllUserWithPhone')
  .post(auth(), validate(chatValidation.getAllUserWithPhone), chatController.getAllUserWithPhone);
router.route('/against/').get(auth(), validate(chatValidation.getAgainstChat), chatController.getChatAgainstUser);
router
  .route('/')
  .post(auth(), validate(chatValidation.createChat), chatController.createChat)
  .get(auth(), validate(chatValidation.getChats), chatController.getChats);

router
  .route('/uploadFile/')
  .post(auth(), fileController.multipleUpload, validate(chatValidation.uploadFileChat), chatController.uploadChatFile);
router
  .route('/:chatId')
  .get(auth(), validate(chatValidation.getChat), chatController.getChat)
  .delete(auth(), validate(chatValidation.deleteChat), chatController.deleteChat)
  .patch(auth(), validate(chatValidation.updateChatMessageToSeen), chatController.updateChatMessageToSeen);
router
  .route('/block/:chatId')
  .post(auth(), validate(chatValidation.blockChat), chatController.blockChat);

module.exports = router;
