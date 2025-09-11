// Models index file - Central export for all database models

const User = require('./User');
const Lead = require('./Lead');
const Course = require('./Course');
const Enrollment = require('./Enrollment');
const Payment = require('./Payment');
const Affiliate = require('./Affiliate');
const ABTest = require('./ABTest');

module.exports = {
  User,
  Lead,
  Course,
  Enrollment,
  Payment,
  Affiliate,
  ABTest
};