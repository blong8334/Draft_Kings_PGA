let req_prom = require('request-promise');

let url = 'http://www.pgatour.com/data/players/player.json';

// http://www.pgatour.com/data/r/current/field.xml


req_prom(url)
  .then(stuff => {
    let players = JSON.parse(stuff);
    // let keys = Object.keys(players);
    // keys:  [ 'header', 'plrs' ]
    let keys = Object.keys(players.plrs);
    // console.log(keys);
    // keys go from 0 to 99+14404
    console.log(players.plrs[2]);
    let playerArr = [];
    for (let key in players.plrs) {
      playerArr.push();
    }
    // in players
  });

/*
rp('http://localhost:3000/player_list')
  .then(res => {
      res = JSON.parse(res);
      let bulkArr = [];
      for (let key in res) {
        if (! res[key].href) {
          continue;
        }
        let playerArr = res[key].href.split('.');
        //get rid of '.html'
        playerArr.pop();
        let full_name = playerArr.pop();
        full_name = full_name.replace(/-/g, '');
        let pga_id = playerArr.pop();
        bulkArr.push({
          full_name,
          pga_id
        });
      }
      Player_Model.sync({force: true})
        .then(() => {
          Player_Model.bulkCreate(bulkArr)
            .then(res => {
              console.log('Player db updated successfully!');
            });
        });
  })
  .catch(err => {
    console.error(err);
  });
*/
