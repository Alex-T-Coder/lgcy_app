const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { timelineService, authService, userService } = require('../services');

const createTimeline = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const timeline = await timelineService.createTimeline(req.body, req.file, userId);
  res.status(httpStatus.CREATED).send(timeline);
});

const getTimelines = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  let userIds = [];
  let users = [];
  if (req.query.search) {
    let filter = {
      name: { $regex: `.*${req.query.search}.*`, $options: 'i' },
    };
    const user = await userService.queryUsers(filter, options);
    userIds = user.results.map((user) => user._id);
    users = user;
  } else {
    filter = pick(req.query, ['name', 'role']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const user = await userService.queryUsers(filter, options);
    userIds = user.results.map((user) => user._id);
    users = user;
  }
  if (req.query.search) {
    filter = {
      $or: [
        { title: { $regex: `.*${req.query.search}.*`, $options: 'i' } },
        {
          creator: {
            $in: userIds,
          },
        },
      ],
    };
  } else {
    filter = pick(req.query, ['title', 'role']);
  }
  const result = await timelineService.queryTimelines(filter, options);
  res.send({ 
    users: users,
    timelines: result
   });
});

const getTimelinesByCreator = catchAsync(async (req, res) => {
  // const filter = pick(req.query, ['title', 'description']);
  const filter = {};
  const options = pick(req.query, ['limit', 'page', 'sortBy']);
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const result = await timelineService.getTimelineByCreator(userId, filter, options);
  res.send({ ...result });
});

const getTimelinesByCreatorID = catchAsync(async (req, res) => {
  const filter = {};
  const options = pick(req.query, ['limit', 'page', 'userId']);
  const result = await timelineService.getTimelineByCreator(options.userId, filter, options);
  res.send(result);
});

const getTimeline = catchAsync(async (req, res) => {
  const timeline = await timelineService.getTimelineById(req.params.timelineId);
  if (!timeline) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Timeline not found');
  }
  res.send(timeline);
});

const updateTimeline = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  const timeline = await timelineService.updateTimelineById(req.params.timelineId, req.body, req.file, userId);
  res.send(timeline);
});

const deleteTimeline = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  await timelineService.deleteTimelineById(req.params.timelineId, userId);
  res.status(httpStatus.OK).send();
});

const follow = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  await timelineService.follow(req.params.timelineId, userId);
  res.status(httpStatus.OK).send();
});

const unfollow = catchAsync(async (req, res) => {
  const userId = await authService.getUserIdFromToken(req.headers.authorization);
  await timelineService.unfollow(req.params.timelineId, userId);
  res.status(httpStatus.OK).send();
});

module.exports = {
  follow,
  unfollow,
  createTimeline,
  getTimelines,
  getTimeline,
  updateTimeline,
  deleteTimeline,
  getTimelinesByCreator,
  getTimelinesByCreatorID,
};
