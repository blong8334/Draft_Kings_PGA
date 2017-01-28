const Sequelize = require('sequelize');
const db = require('../_db');

const Tournament_Results = db.define('tournament_results', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  pga_id: {
    type: Sequelize.STRING
  },
  score_cards: {
    type: Sequelize.JSON
  },
  place: {
    type: Sequelize.STRING
  },
  tourn_id: {
    type: Sequelize.STRING
  }
});

module.exports = Tournament_Results;
