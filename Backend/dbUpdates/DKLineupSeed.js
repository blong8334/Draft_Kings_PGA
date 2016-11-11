const fs = require('fs');
const { db, DK_Table, Curr_Tourn } = require('../server/index');
const req_prom = require('request-promise')

fs.readFile('/Users/brianlong/Fullstack/Draft_Kings/Backend/dk_info/DKSalaries.csv', (err, data) => {
  if (err) throw err;

  var bulkArr = bulkArrCreator(data);

  DK_Table.sync({force: true})
    .then(() => {
      bulkArr.forEach(el => {
        DK_Table.create(el)
          .then(resp => {
            console.log('Success!');
            Curr_Tourn.findOne({
              where: {
                id: resp.dataValues.currTournId
              }
            })
            .then(resp => {
              // var keepGoing = true;
              // var breakOut = false;
              var url = 'http://www.pgatour.com/data/players/'+resp.dataValues.pga_id+'/2016stat.json';
              // while (keepGoing) {
                // keepGoing = false;
/*
                req_prom(url)
                .then(res => {
                  DK_Table.update({
                    stats: res
                  }, {
                    where: {
                      currTournId: resp.dataValues.id
                    }
                  })
                  .then(res => {
                    console.log('success');
                  })
                  .catch(err => {
                    // if (! breakOut) {
                    //   console.log('DOOTSY');
                    //   url = 'http://www.pgatour.com/data/players/'+resp.dataValues.pga_id+'/2016stat.json';
                    //   breakOut = true;
                    //   keepGoing = true;
                    // }
                    console.error(err);
                  })
                })
*/
              // }
            });
          })
      });
    })
    .catch(err => {
      console.error(err);
    });
});

function bulkArrCreator (data) {
  var dkArr =  data.toString().split(',');
  // 6th element is name
  // 7th is salary.
  // go every fifth el after that for the players.

  // let us build the bulkCreate array for the dk players table.
  var dkBulkArr = [];

  // split the name on the space.
  // el 0 is first name, the rest is last name.
  // convert full name to lowercase
  // look up name is any-non a-z  chars replaces with ''
  // let us make a beforeCreate hook that insert the pga id into the row.
  // maybe an after create hook to request the stats from pga tour site.
  var first_name, last_name, dk_salary;
  var ind = 6;
  while (dkArr[ind]) {
    var tempName = dkArr[ind].split(' ');
    last_name = tempName.pop();
    last_name = last_name.slice(0, last_name.length-1);
    first_name = tempName.join(' ').slice(1);
    dk_salary = dkArr[ind + 1];
    dkBulkArr.push({first_name, last_name, dk_salary});
    ind += 5;
  }
  return dkBulkArr;
}
