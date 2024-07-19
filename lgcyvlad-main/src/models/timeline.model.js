const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { status } = require('../config/status');

const timelineSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageType: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo',
    },
    coverImage: {
      real: {
        type: String,
        trim: true,
      },
      key: {
        type: String,
      },
      url: {
        type: String,
        trim: true,
      },
    },
    status: {
      value: {
        type: Object,
        enum: status,
        default: 'secret',
      },
      followerShown: {
        type: Boolean,
        default: false,
      },
      inviters: {
        type: Array,
        default: [],
      },
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    link: {
      type: String,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
timelineSchema.plugin(toJSON);
timelineSchema.plugin(paginate);

timelineSchema.statics.addFollower = async function (timelineId, userId) {
  return this.updateOne({ _id: timelineId }, { $addToSet: { followers: userId } });
};

timelineSchema.statics.removeFollower = async function (timelineId, userId) {
  return this.updateOne({ _id: timelineId }, { $pull: { followers: userId } });
};

timelineSchema.statics.isFollowed = async function (userId) {
  return this.followers.contains(userId);
};

/**
 * @typedef Timeline
 */
const Timeline = mongoose.model('Timeline', timelineSchema);

module.exports = Timeline;
