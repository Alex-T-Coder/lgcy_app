const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const commentValidation = require('../../validations/comment.validation');
const commentController = require('../../controllers/comment.controller');

const router = express.Router();

router.route('/like-toggle/:commentId').post(auth(), validate(commentValidation.likeComment), commentController.likeComment);

router.route('/getComments/:postId').get(auth(), validate(commentValidation.getComments), commentController.getComments);
router.route('/addComment/:postId').post(auth(), validate(commentValidation.addComment), commentController.addComment);

router.route('/replies/:commentId').post(auth(), validate(commentValidation.addReply), commentController.addReply);

router
  .route('/deleteComment/:commentId')
  .delete(auth(), validate(commentValidation.deleteComment), commentController.deleteComment);

router
  .route('/deleteReply/:commentId/:replyId')
  .delete(auth(), validate(commentValidation.deleteReply), commentController.deleteReply);

module.exports = router;
