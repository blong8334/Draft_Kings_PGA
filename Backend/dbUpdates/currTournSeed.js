const { Curr_Tourn, db } = require('../data_base/index');
const req_prom = require('request-promise');


// NOTE: the current week's tournament id from the pga site.
// NOTE: Curr tourn: Hero World Challenge.
const tourn_id = '478';

let url = `http://www.pgatour.com/data/r/${tourn_id}/field.json`;

// THIS FILE POPULATES THE CURR TOURN TABLE FOR THE WEEKS TOURN.

req_prom(url)
  .then(stuff => {
    let players = JSON.parse(stuff);
    let bulkArr = [];
    let mootzie = players.Tournament.Players

    for (let key in mootzie) {
      bulkArr.push({
        name: mootzie[key].PlayerName,
        pga_id: mootzie[key].TournamentPlayerId,
        sorted_name: mootzie[key].PlayerName.toLowerCase().replace(/[^a-z]/g, '')
                                .split('').sort().join('')
      });
    }

    Curr_Tourn.sync({force: true})
      .then(() => {
        Curr_Tourn.bulkCreate(bulkArr)
          .then(() => {
            console.log('All updated successfully!');
          });
      })
      .catch(err => {
        console.error(err);
      })
  });
