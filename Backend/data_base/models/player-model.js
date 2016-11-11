const Sequelize = require('sequelize');
const db = require('../_db');

const Player_Table = db.define('player-table', {
  pga_id: {
    type: Sequelize.STRING,
    allowNull: false
  },
  full_name: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  classMethods: {
    getPlayerId: (name) => {
      return Player_Table.findOne({
        where: {
          full_name: name
        }
      });
    },
    getPlayerById: (id) => {
      return Player_Table.findOne({
        where: {
          id: id
        }
      });
    }
  }
});

module.exports = Player_Table;
