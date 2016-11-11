const Sequelize = require('sequelize');
const db = require('../_db');
const rp = require('request-promise');
const Curr_Tourn = require('./curr-tourn-model');

const DK_Table = db.define('dk-table', {
  dk_salary: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  first_name: {
    type: Sequelize.STRING
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  stats: {
    type: Sequelize.JSON,
  }
} , {
  hooks: {
    beforeCreate: (user, options) => {
      var userFirst = user.dataValues.first_name;
      var userLast = user.dataValues.last_name;
      var sorted_user = (userFirst+userLast).toLowerCase()
      .replace(/[^a-z]/g, '').split('').sort().join('');

      // full name with all a-z chars, sorted.
      // if you get nothing, or get more than one
      // last name only
      // if you still get nothing leave it blank.

      return Curr_Tourn.findOne({
        where: {
          sorted_name: sorted_user
        }
      })
      .then(res => {
        // console.log(res);
        if (res) {
          user.currTournId = res.dataValues.id;
          return user;
        } else {
          return Curr_Tourn.findAll({
            where: {
              name: {
                $iLike: '%'+userLast+'%'
              }
            }
          })
          .then(res => {
            console.log('Exact name match not found in PGA field table.');
            console.log(res);
            if (res.length === 1) {
              user.currTournId = res[0].dataValues.id;
            }
            return user;
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
    }
  }
});

module.exports = DK_Table;
