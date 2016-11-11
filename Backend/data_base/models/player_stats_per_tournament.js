const Sequelize = require('sequelize');
const db = require('../_db');

const Players_Stats_Per_Tournament = db.define('player_stats_per_tournament', {
  tournament_id: {
    type: Sequelize.INTEGER
  },
  player_id: {
    type: Sequelize.STRING
  },
  player_name: {
    type: Sequelize.STRING
  },
  stats: {
    type: Sequelize.JSON
  },
  tourn_begin_date: {
    type: Sequelize.DATE
  }
});

module.exports = Players_Stats_Per_Tournament;
