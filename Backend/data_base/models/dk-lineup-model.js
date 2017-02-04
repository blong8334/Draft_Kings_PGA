const Sequelize = require('sequelize');
const db = require('../_db');

const DK_Table = db.define('dk-table', {
  dk_salary: {
    type: Sequelize.INTEGER
  },
  name: {
    type: Sequelize.STRING
  },
  pga_id: {
    type: Sequelize.STRING
  },
  tourn_id: {
    type: Sequelize.STRING,
  }
});

module.exports = DK_Table;
