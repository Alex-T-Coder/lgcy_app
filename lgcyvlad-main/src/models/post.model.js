const mongoose = require('mongoose');
const moment = require('moment');
const { toJSON, paginate } = require('./plugins');

const postSchema = mongoose.Schema(
  {
    files: [
      {
        memeType: {
          type: String,
          required: true,
          default: 'image/jpeg',
          trim: true,
        },
        real: {
          type: String,
          required: true,
          trim: true,
        },
        key: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scheduleDate: {
      type: Date,
      trim: true,
    },
    liking: {
      type: Boolean,
      default: false,
    },
    commenting: {
      type: Boolean,
      default: false,
    },
    twitter: {
      type: Boolean,
      default: false,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: [] }],
    share: {
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
      timelines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Timeline', default: [] }],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
postSchema.plugin(toJSON);
postSchema.plugin(paginate);

postSchema.pre('save', function (next) {
  const post = this;
  if (!this.isNew) {
    next();
  }
  try {
    const currentDate = moment();
    const scheduleDate = moment(post.scheduleDate);
    const differe = scheduleDate.diff(currentDate, 'days');

    if (differe > 0) {
      throw new Error('Post should not be scheduled in past');
    }
    post.scheduleDate = scheduleDate;
    next();
  } catch (error) {
    return next(error);
  }
});
postSchema.statics.queryPosts = async function (filter, options) {
  const { timeline, ...mongoFilter } = filter;

  if (timeline) {
    mongoFilter['share.timelines'] = mongoose.Types.ObjectId(timeline);
  }

  return this.paginate(mongoFilter, options);
};

/**
 * @typedef Post
 */
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
