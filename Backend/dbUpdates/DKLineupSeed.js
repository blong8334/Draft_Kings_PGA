const fs = require('fs');
const { db, DK_Table, Curr_Tourn } = require('../data_base/index');
const req_prom = require('request-promise');
const FuzzySet = require('fuzzyset.js');

const tourn_id = '004';

fs.readFile(`/Users/brianlong/Documents/DK_Salaries/DKSalaries${tourn_id}.csv`, (err, data) => {
  if (err) throw err;
  bulkArrCreator(data)
  .then(res => DK_Table.destroy({where: {tourn_id}}).then(() => res))
  .then(res => DK_Table.bulkCreate(res))
  .then(res => console.log("Cool, we're cool :)"))
  .catch(err => console.error(err));
});

function bulkArrCreator (data) {
  return Curr_Tourn.findAll()
  .then(res => {
    let info = {sorted: [], unsorted: [], pga_id: []};
    res.forEach(el => {
      info.unsorted.push(el.name);
      info.sorted.push(el.name.toLowerCase().replace(/[^a-z]/g, "").split('').sort().join(''));
      info.pga_id.push(el.pga_id);
    });
    return info;
  })
  .then(({unsorted, sorted, pga_id}) => {
    let ind = 6, dkBulkArr = [], dkArr = data.toString().split(','), fuzzyNames = FuzzySet(sorted);
    while (dkArr[ind]) {
      let dkCSVSortedName = dkArr[ind].toLowerCase().replace(/[^a-z]/g, "").split('').sort().join('');
      let guess = fuzzyNames.get(dkCSVSortedName);
      let dk_salary = dkArr[ind + 1];
      if (guess.length < 2 && guess[0][0] > 0.7) {
        let idx = sorted.indexOf(guess[0][1]);
        dkBulkArr.push({name: unsorted[idx], pga_id: pga_id[idx], dk_salary, tourn_id});
      } else {
        dkBulkArr.push({name: dkArr[ind].slice(1,dkArr[ind].length-1), pga_id: null, dk_salary, tourn_id});
        console.log(`Cannot find ${dkArr[ind]}`);
      }
      ind += 5;
    }
    return dkBulkArr;
  });
}
