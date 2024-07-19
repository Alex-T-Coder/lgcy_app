const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const OPTModelSchema = mongoose.Schema({
  otp: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  expirationDate: {
    type: Date,
    trim: true,
    required: true,
    default: new Date(),
  },
});

/**
 * @typedef OPTModel
 */

// add plugin that converts mongoose to json
OPTModelSchema.plugin(toJSON);
OPTModelSchema.plugin(paginate);

const OtpModel = mongoose.model('OPTModel', OPTModelSchema);

module.exports = OtpModel;
