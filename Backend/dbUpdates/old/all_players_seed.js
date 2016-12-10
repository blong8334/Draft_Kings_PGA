const Player_Model = require('./models/player-model');
const req_prom = require('request-promise');

req_prom('http://localhost:3000/player_list')
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
