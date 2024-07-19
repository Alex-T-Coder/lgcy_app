const mongoose = require('mongoose');
const { bool } = require('joi');
const { toJSON, paginate } = require('./plugins');


const commentSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a User model
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    replies: [{
        content: {
            type: String,
            required: true,
          },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
          },
        createdAt: { type: Date, default: Date.now },
    }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  }, {
    timestamps: true,
  });
  
  const Comment = mongoose.model('Comment', commentSchema);

  commentSchema.plugin(toJSON);
  
  module.exports = Comment;

