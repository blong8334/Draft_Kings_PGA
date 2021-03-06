const Sequelize = require('sequelize');
const db = require('../_db');

const Curr_Tourn = db.define('curr_tourn', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  pga_id: {
    type: Sequelize.STRING
  },
  tourn_id: {
    type:Sequelize.STRING
  }
});

module.exports = Curr_Tourn;
