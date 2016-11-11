const { DK_Table, Curr_Tourn, Players_Stats_Per_Tournament } = require('/Users/brianlong/Fullstack/Draft_Kings/Backend/data_base/index.js');

// we need salary, pga_id, name, and list of stats.

// we will use an object with the pga id.

// Something like this:
// {pga_id = {
//   player name: ,
//   dk_salary: ,
//   tourns: need to have the stats for that tourn and the date so we can later
//   figure out how to calculate the stats per week.
// }
// }

// first get salary and currTournId from dk-tables.

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
    // NOTE: return the array of player info for the current tournament.
    return make_sense_of_player_stats(res);
  });

}
function make_sense_of_player_stats (player_arr) {
  // NOTE: in here we are going through each player's stats and keep only the
  // meaningful ones because sometimes players show having data for certain stats
  // when they actually dont.

  // NOTE: player_arr is an array of objects which look like:
  // {
  //   pga_id: arr[index].pga_id,
  //   dk_salary: arr[index].dk_salary,
  //   player_name: arr[index].name,
  //   stats: [/*{tournId, stats, date}*/]
  // }
  // NOTE: some people might have no stats.

  for (var i = 0; i < 1; i++) {
    var current_player = player_arr[i];
    for (var j = 0; j < current_player.stats.length; j++) {
      var current_stats = current_player.stats[j].stats[0];
      console.log(current_stats);
    }
  }

}

function pga_id_AND_stats_AND_dk_salary (arr) {
  // NOTE: the point of this function is to receive an arry of players with
  // a pga id and query from the db to get all the stats we have for this certain player.

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
          date: tourn.dataValues.createdAt,
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
