const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const notificationValidation = require('../../validations/notification.validation');
const notificationController = require('../../controllers/notification.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(notificationValidation.createNotification), notificationController.createNotification)
  .get(auth(), validate(notificationValidation.getNotifications), notificationController.getNotifications);

router.get('/unreadCounts', auth(), notificationController.getUnreadNotifications);
router.post('/markRead/:notificationId', auth(), validate(notificationValidation.makeAsReadNotification), notificationController.makeRead);
router.post('/markReadAll', auth(), notificationController.makeReadAll);

router
  .route('/:notificationId')
  .get(auth(), validate(notificationValidation.getNotification), notificationController.getNotification)
  .patch(auth(), validate(notificationValidation.updateNotification), notificationController.updateNotification)
  .delete(auth(), validate(notificationValidation.deleteNotification), notificationController.deleteNotification);

module.exports = router;
