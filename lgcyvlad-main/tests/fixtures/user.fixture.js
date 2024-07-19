const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const User = require('../../src/models/user.model');

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.firstName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
  phonenumber: '21356546',
  username: faker.name.firstName(),
  birthday: '02-14-2022',
};

const userTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.firstName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
  phonenumber: '21356546',
  username: faker.name.firstName(),
  birthday: '02-14-2022',
};

const admin = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.firstName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  isEmailVerified: false,
  phonenumber: '21356546',
  username: faker.name.firstName(),
  birthday: '02-14-2022',
};

const insertUsers = async (users) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

module.exports = {
  userOne,
  userTwo,
  admin,
  insertUsers,
};
