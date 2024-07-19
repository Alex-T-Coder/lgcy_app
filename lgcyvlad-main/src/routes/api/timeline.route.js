const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const timelineValidation = require('../../validations/timeline.validation');
const timelineController = require('../../controllers/timeline.controller');
const fileController = require('../../controllers/file.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), fileController.singleUpload, validate(timelineValidation.createTimeline), timelineController.createTimeline)
  .get(auth(), validate(timelineValidation.getTimelines), timelineController.getTimelines);

router
  .route('/ByCreator')
  .get(auth(), validate(timelineValidation.getCreatorTimelines), timelineController.getTimelinesByCreator);

  router
  .route('/ByUser')
  .get(auth(), validate(timelineValidation.getCreatorIDTimelines), timelineController.getTimelinesByCreatorID);

router
  .route('/:timelineId')
  .get(auth(), validate(timelineValidation.getTimeline), timelineController.getTimeline)
  .patch(auth(), fileController.singleUpload, validate(timelineValidation.updateTimeline), timelineController.updateTimeline)
  .delete(auth(), validate(timelineValidation.deleteTimeline), timelineController.deleteTimeline);

router.route('/:timelineId/follow').post(auth(), validate(timelineValidation.followTimeline), timelineController.follow);
router.route('/:timelineId/unfollow').post(auth(), validate(timelineValidation.followTimeline), timelineController.unfollow);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Timelines
 *   description: Timeline management and retrieval
 */

/**
 * @swagger
 * /timelines:
 *   post:
 *     summary: Create a timeline
 *     description: Everyone can create other timelines.
 *     tags: [Timelines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: object
 *             example:
 *               title: fake title
 *               description: fake description
 *               status:
 *                value: public
 *                followerShown: false
 *                inviters: ['63f37f8579186e188c14d54b', '92f37f8579186e188c14d57d']
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Timeline'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all timelines
 *     description: everyone can retrieve all timelines.
 *     tags: [Timelines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         title: name
 *         schema:
 *           type: string
 *         description: Timeline title
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Timeline description
 *       - in: query
 *         name: timelinename
 *         schema:
 *           type: string
 *         description: Timelinename
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. title:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of timelines
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Timeline'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /timelines/ByCreator:
 *   get:
 *     summary: Get timelines of loginUser
 *     description: Logged in timelines can fetch only their own timeline information. Only admins can fetch other timelines.
 *     tags: [Timelines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         title: title
 *         schema:
 *           type: string
 *         description: Timeline title
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Timeline description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of timelines
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Timeline'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * /timelines/{id}:
 *   get:
 *     summary: Get a timeline
 *     description: Logged in timelines can fetch only their own timeline information. Only admins can fetch other timelines.
 *     tags: [Timelines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeline id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Timeline'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a timeline
 *     description: Logged in timelines can only update their own information. Only admins can update other timelines.
 *     tags: [Timelines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeline id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: object
 *             example:
 *               title: fake title
 *               description: fake description
 *               status:
 *                value: public
 *                followerShown: false
 *                inviters: ['63f37f8579186e188c14d54b', '92f37f8579186e188c14d57d']
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Timeline'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a timeline
 *     description: Logged in timelines can delete only themselves. Only admins can delete other timelines.
 *     tags: [Timelines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeline id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /timelines/{id}/follow:
 *   post:
 *     summary: Follow user to the timeline
 *     description: Owner can't follow his own timeline
 *     tags: [Timelines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeline id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /timelines/{id}/unfollow:
 *   post:
 *     summary: Unfollow user from the timeline
 *     description: Unfollow user from the timeline
 *     tags: [Timelines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeline id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
