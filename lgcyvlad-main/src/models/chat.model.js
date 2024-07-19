const mongoose = require('mongoose');
const { bool } = require('joi');
const { toJSON, paginate } = require('./plugins');

const chatSchema = mongoose.Schema(
  {
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isSeen: {
          type: Boolean,
          default: false,
        },
        text: { type: String, default: null },
        file: {
          memeType: {
            type: String,
            required: true,
            default: 'image/jpeg',
            trim: true,
          },
          real: {
            type: String,
            trim: true,
            default: null,
          },
          key: {
            type: String,
            default: null,
          },
          url: {
            type: String,
            default: null,
            trim: true,
          },
        },
        createdAt: { type: Date, default: new Date() },
      },
    ],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
chatSchema.plugin(toJSON);
chatSchema.plugin(paginate);

/**
 * @typedef Chat
 */
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
