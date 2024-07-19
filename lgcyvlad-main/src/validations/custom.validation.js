const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  if (!value.match(/^[A-Za-z0-9_@.#&+|*()^$%-]*$/)) {
    return helpers.message('password must contain alphabets, numbers and special character only');
  }
  return value;
};

const name = (value, helpers) => {
  if (!value.match(/^[a-zA-Z0-9]*$/)) {
    return helpers.message('For {#label} only alphabets and number are allowed');
  }
  return value;
};

module.exports = {
  objectId,
  password,
  name,
};
