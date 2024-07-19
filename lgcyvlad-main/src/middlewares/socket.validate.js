const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const socketValidate = (data, schema) => {
  const { value, error } = schema.validate(data);

  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
  return value;
};

module.exports = socketValidate;
