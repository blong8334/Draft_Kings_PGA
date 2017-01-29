const Sequelize = require('sequelize');
const db = require('../_db');

const Tournament_Results = db.define('tournament_results', {
  player_name: {
    type: Sequelize.STRING
  },
  pga_id: {
    type: Sequelize.STRING
  },
  score_cards: {
    type: Sequelize.JSON
  },
  dk_points: {
    type: Sequelize.STRING
  },
  tourn_id: {
    type: Sequelize.STRING
  }
});

module.exports = Tournament_Results;
