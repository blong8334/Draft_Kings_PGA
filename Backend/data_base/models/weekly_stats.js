const Sequelize = require('sequelize');
const db = require('../_db');

const Weekly_Field_Stats = db.define('weekly_field_stats', {
  tournament_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  stats: {
    type: Sequelize.JSON
  }
});

module.exports = Weekly_Field_Stats;
