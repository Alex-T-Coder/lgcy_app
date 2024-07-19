const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const postValidation = require('../../validations/post.validation');
const postController = require('../../controllers/post.controller');
const fileController = require('../../controllers/file.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), fileController.multipleUpload, validate(postValidation.createPost), postController.createPost)
  .get(auth(), validate(postValidation.getPosts), postController.getPosts);

router.get('/home', auth(), validate(postValidation.getHomePost), postController.getHomePost);

router
  .route('/:postId')
  .get(auth(), validate(postValidation.getPost), postController.getPost)
  .patch(auth(), fileController.multipleUpload, validate(postValidation.updatePost), postController.updatePost)
  .delete(auth(), validate(postValidation.deletePost), postController.deletePost);

router.route('/private/:userId').get(auth(), validate(postValidation.getPrivate), postController.getPrivate);

router
  .route('/like-toggle/:postId')
  .post(auth(), validate(postValidation.likeToggle), postController.likeToggle);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management and retrieval
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a post
 *     description: Everyone can create other posts.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - myFiles
 *               - share
 *             properties:
 *               myFiles:
 *                 type: string
 *                 format: binary
 *               liking:
 *                 type: boolean
 *               commenting:
 *                 type: boolean
 *               twitter:
 *                 type: boolean
 *               share:
 *                 type: object
 *                 properties:
 *                   users:
 *                     type: array
 *                   timelines:
 *                     type: array
 *               scheduleDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *             example:
 *               share:
 *                 users: ['63f37f8579186e188c14d54b', '92f37f8579186e188c14d57d']
 *                 timelines: ['63f37f8579186e188c14d54b', '92f37f8579186e188c14d57d']
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Post'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all posts
 *     description: everyone can retrieve all posts.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         title: name
 *         schema:
 *           type: string
 *         description: Post title
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Post description
 *       - in: query
 *         name: postname
 *         schema:
 *           type: string
 *         description: Postname
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
 *         description: Maximum number of posts
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
 *                     $ref: '#/components/schemas/Post'
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
 * /posts/{id}:
 *   get:
 *     summary: Get a post
 *     description: Logged in posts can fetch only their own post information. Only admins can fetch other posts.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Post'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a post
 *     description: Logged in posts can only update their own information. Only admins can update other posts.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               scheduleDate:
 *                 type: string
 *                 format: date
 *               myFiles:
 *                 type: string
 *                 format: binary
 *               liking:
 *                 type: boolean
 *               commenting:
 *                 type: boolean
 *               twitter:
 *                 type: boolean
 *               share:
 *                 type: object
 *                 properties:
 *                   users:
 *                     type: array
 *                   timelines:
 *                     type: array
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Post'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a post
 *     description: Logged in posts can delete only themselves. Only admins can delete other posts.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post id
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
