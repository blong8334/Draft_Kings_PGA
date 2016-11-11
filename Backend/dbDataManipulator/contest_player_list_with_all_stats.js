const { DK_Table, Curr_Tourn, Players_Stats_Per_Tournament } = require('/Users/brianlong/Fullstack/Draft_Kings/Backend/data_base/index.js');

// NOTE: the point of this file is pull stats for each player
// that is in the current tournament field from the db for the specified
// last number of weeks.

// the next step is to take those stats and send them to another file.


// NOTE: lastX is the last number of tournaments to consider for
// each player.
const lastX = 2;

// NOTE: this is the main function.
controller();


function controller () {
  // NOTE: first we get salaries and curr tourn id's
  return dk_salary_AND_currTourn_id()
  .then(res => {
    // NOTE: then we pass the response to the next function to
    // get a promise array of pga_id's and dk_salaries.
    return dk_salary_AND_pga_id(res);
  })
  .then(res => {
    // NOTE: get any stats that we have saved for the player.
    return pga_id_AND_stats_AND_dk_salary(res);
  })
  .then(res => {
    return filter_last_x_tournaments(res, lastX)
  });
}

function filter_last_x_tournaments (arr, lastX) {
// NOTE: this function return the lastX number of tournaments
// for each player if the player has more than lastX tournaments.
// if not, then we do nothing with them.

  console.log('arr ', arr);
  arr.forEach(player => {
    var tourn_stats = player.stats;
    if (tourn_stats.length > lastX) {
      tourn_stats.sort((a, b) => -1 * (a.date - b.date));
      player.stats = tourn_stats.slice(0, lastX);
    }
  });
  return arr;
}

function pga_id_AND_stats_AND_dk_salary (arr) {
  // NOTE: the point of this function is to receive an arry of players with
  // a pga id and query from the db to get all the stats we have for this player.

  var statsAndNameArr = [];
  var newArr = [];

  statsAndNameArr = arr.map(player => {
    // NOTE: map over the arguments array and find player stats
    // where id's match.  Players can have more than one row of stats since
    // they play in multiple tournaments.
    return Players_Stats_Per_Tournament.findAll({
      where: {
        player_id: player.pga_id
      }
    })
    .catch(err => console.error('Trouble in pga_id_AND_stats_AND_dk_salary'));
  })

  return Promise.all(statsAndNameArr)
  .then(res => {
    // NOTE: in this part of the function we are going to build
    // the object to return.  this object contains player info and their
    // stats from all past tournament.
    newArr = res.map((player_stats, index) => {
      var retObj = {
        pga_id: arr[index].pga_id,
        dk_salary: arr[index].dk_salary,
        player_name: arr[index].name,
        stats: [/*{tournId, stats, date}*/]
      }
      // NOTE: If players have no stats in the db return the object built above.
      if (! player_stats.length) {
        console.log(arr[index].name, ' has no stats in the db.');
        return retObj;
      }
      player_stats.forEach(tourn => {
        // NOTE: since we are doing a findall above, the response will be
        // an array with potentially multiple rows.  we loop over each item in the
        // response array to pick out their stats and add them to the return obj.
        retObj.stats.push({
          tournament_id: tourn.dataValues.tournament_id,
          date: tourn.dataValues.tourn_begin_date,
          stats: tourn.dataValues.stats
        });
      });
      return retObj;
    });
    return newArr;
  })
  .catch(err => console.error(err));
}

function dk_salary_AND_pga_id (arr) {
  // NOTE: This function returns a Promise arry of objects with
  // pga_id and dk_salary properties.

  // NOTE: It takes an array as an argument that has a currTourn property
  // and a dk_salary property.

  var pgaIdArr = [];
  var newArr = [];

  pgaIdArr = arr.map(player => {
    // NOTE: we map over the array we receive from the previous function.
    return Curr_Tourn.findOne({
      // NOTE: query from the db the player's id matches the curr tourn id and return
      // only the players name and their pga tour id.
      where: {id: player.currTournId}
    },{
      attributes: ['pga_id', 'name']
    })
    .catch(err => console.error('err in dk_salary_AND_pga_id'));
  });

  return Promise.all(pgaIdArr)
  .then(res => {
    // NOTE: map over the db response and pick out the players pga id
    // and their name and build a new object with salary and from the arguments arr.
    newArr = res.map((player, index) => {
      var pga_id = player.dataValues.pga_id;
      var dk_salary = arr[index].dk_salary;
      var name = player.dataValues.name;
      return {pga_id, dk_salary, name};
    });
    return newArr;
  })
}

function dk_salary_AND_currTourn_id () {
  // NOTE: This function returns a promise of all player salaries and their
  // foreign key currTourn id

  return DK_Table.findAll({
    attributes: ['dk_salary', 'currTournId']
  })
  .then(res => {
    // we only need to return the dataValues for each row.
    // IDEA: do all the work in here.
    var playerArr = res.map(player => {
      return player.dataValues;
    });
    return playerArr;
  })
  .catch(err => console.error('trouble in dk_salary_AND_pga_id'));
}
