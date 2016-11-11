const { Curr_Tourn, db } = require('../server/index');
const req_prom = require('request-promise');

var url = 'http://www.pgatour.com/data/r/457/field.json';

// THIS FILE POPULATES THE CURR TOURN TABLE FOR THE WEEKS TOURN.

req_prom(url)
  .then(stuff => {
    var players = JSON.parse(stuff);
    // var players = JSON.parse(players.Players);
    console.log(players.Tournament.Players);

    var bulkArr = [];
    var mootzie = players.Tournament.Players

    for (var key in mootzie) {
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
            console.log('updated!');
          });
      })
      .catch(err => {
        console.error(err);
      })
  });
