const Sequelize = require('sequelize');
const db = require('../_db');

const Course_Info = db.define('course_info', {
  tourn_id: {
    type: Sequelize.STRING
  },
  info: {
    type: Sequelize.JSON
  }
});

module.exports = Course_Info;
