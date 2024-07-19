const joi = require('joi');
const ApiError = require('./ApiError');
const httpStatus = require('http-status');

const validateSocketData = (schema, data, handler) => {
  const { value, error } = joi.compile(schema).validate(data);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, errorMessage);
  } else if (handler) {
    return handler(data);
  }
  return value;
};

module.exports = validateSocketData;
