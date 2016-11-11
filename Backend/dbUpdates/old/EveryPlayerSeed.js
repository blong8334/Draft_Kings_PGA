var req_prom = require('request-promise');

var url = 'http://www.pgatour.com/data/players/player.json';

// http://www.pgatour.com/data/r/current/field.xml


req_prom(url)
  .then(stuff => {
    var players = JSON.parse(stuff);
    // var keys = Object.keys(players);
    // keys:  [ 'header', 'plrs' ]
    var keys = Object.keys(players.plrs);
    // console.log(keys);
    // keys go from 0 to 99+14404
    console.log(players.plrs[2]);
    var playerArr = [];
    for (var key in players.plrs) {
      playerArr.push();
    }
    // in players
  });

/*
rp('http://localhost:3000/player_list')
  .then(res => {
      res = JSON.parse(res);
      var bulkArr = [];
      for (var key in res) {
        if (! res[key].href) {
          continue;
        }
        var playerArr = res[key].href.split('.');
        //get rid of '.html'
        playerArr.pop();
        var full_name = playerArr.pop();
        full_name = full_name.replace(/-/g, '');
        var pga_id = playerArr.pop();
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
