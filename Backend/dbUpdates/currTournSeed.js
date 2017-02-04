const { Curr_Tourn } = require('../data_base/index');
const req_prom = require('request-promise');


const tourn_id = '003';

req_prom(`http://www.pgatour.com/data/r/${tourn_id}/field.json`)
.then(stuff => {
  let players = JSON.parse(stuff), bulkArr = [], mootzie = players.Tournament.Players;
  for (let key in mootzie) {
    bulkArr.push({
      name: mootzie[key].PlayerName,
      pga_id: mootzie[key].TournamentPlayerId,
      tourn_id
    });
  }
  return Curr_Tourn.sync({force: true})
  .then(() => Curr_Tourn.bulkCreate(bulkArr));
})
.then(res => console.log('Success :)'))
.catch(err => console.error(err));
