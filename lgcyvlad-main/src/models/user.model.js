const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const imageSchema = mongoose.Schema({
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
});

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    birthday: {
      type: String,
      required: false,
      validate(value) {
        if (!value.match(/^(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])-\d{4}$/)) {
          throw new Error('Please enter birthday type correctly');
        }
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    pushToken: {
      type: String,
      required: false,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    notification: {
      type: Boolean,
      default: true,
    },
    directMessage: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    posts: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: [] }],
    },
    image: {
      type: imageSchema,
    },
    timelines: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Timeline', default: [] }],
    },
    timelinesFollowing: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Timeline', default: [] }],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if username is taken
 * @param {string} username - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isUsernameTaken = async function (username, excludeUserId) {
  const user = await this.findOne({ username, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Add User Follower
 * @param {string} follower - The user's follower
 * @param {string} follower - The user's unfollower
 * @returns {Promise<User>}
 */
userSchema.statics.follower = async function (user, follower = null, unfollower = null) {
  let userRecord;
  if (follower) {
    userRecord = await this.findOneAndUpdate(
      { _id: user._id, followers: { $ne: follower } },
      { $addToSet: { followers: follower } },
      { new: true }
    );
  } else if (unfollower) {
    userRecord = await this.findOneAndUpdate(
      { _id: user._id },
      {
        $pull: {
          followers: unfollower,
        },
      },
      { new: true }
    );
  }
  return userRecord;
};

userSchema.statics.followers = async function (userId) {
  return this.findById(userId).select('id name').populate({ path: 'followers', select: 'id name username' });
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.statics.addPost = async function (userId, postId) {
  let user;
  if (postId) {
    user = await this.findOneAndUpdate({ _id: userId }, { $addToSet: { posts: postId } }, { new: true });
  }
  return user;
};

userSchema.statics.removePost = async function (userId, postId) {
  let user;
  if (postId) {
    user = await this.findOneAndUpdate({ _id: userId }, { $pull: { posts: postId } }, { new: true });
  }
  return user;
};

userSchema.statics.addTimeline = async function (userId, timelineId) {
  let user;
  if (timelineId) {
    user = await this.findOneAndUpdate({ _id: userId }, { $addToSet: { timelines: timelineId } }, { new: true });
  }
  return user;
};

userSchema.statics.addTimelineFollowing = async function (userId, timelineId) {
  let user;
  if (timelineId) {
    user = await this.findOneAndUpdate({ _id: userId }, { $addToSet: { timelinesFollowing: timelineId } }, { new: true });
  }
  return user;
};

userSchema.statics.removeTimelineFollowing = async function (userId, timelineId) {
  let user;
  if (timelineId) {
    user = await this.findOneAndUpdate({ _id: userId }, { $pull: { timelinesFollowing: timelineId } }, { new: true });
  }
  return user;
};

userSchema.statics.removeTimeline = async function (userId, timelineId) {
  let user;
  if (timelineId) {
    user = await this.findOneAndUpdate({ _id: userId }, { $pull: { timelines: timelineId } }, { new: true });
  }
  return user;
};

/**  
 * userSchema.statics.removeChat = async function (userId, chatId) {
  return this.findOneAndUpdate(
    { _id: userId },
    { $pull: { chats: chatId } },
    { new: true }
  );
};
*/

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
