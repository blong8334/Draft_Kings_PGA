const { Weekly_Field_Stats, Players_Stats_Per_Tournament } = require('../data_base/index');
const request_promise = require('request-promise');



// WE USE THIS ONE

// USE THIS ONE BEFORE UPDATE_WEEKLY...

// NOTE: The point of this file is to pull the tournament results
// from the pga site for the previous week's tournament and add them to the db.  both the
// weekly stats table and the player stats per tournament table.
// before adding them to the player stats tournament we go through the stats and
// get rid of any stats that may have no data for them, because that does happen.

// NOTE: now when we pull from the players stats table we get a stats list that
// are guaranteed to have no blank stats, avoiding the concern for reporting
// false data where X% of players have a certain stat when in fact they dont have
// any data for that stat.


// NOTE: this is the id of the tournament for the current week.
// you update this.
const id = '047';

// NOTE: this is the date of the tournament.
// you update this.
const date = new Date(2016, 10, 3);

// NOTE: this runs the main function.
controller(id, date);

function controller (id, date) {
  create_tournament_results_by_id(id)
    .then(res => {
      return find_tournament_by_id_AND_return_stats(id)
    })
    .then(res => {
      create_player_stats_entries_for_tournament(res, date);
    })
    .catch(err => console.error('Something happened'));

}

function create_player_stats_entries_for_tournament (arr, date) {

// NOTE: the point of this function is receive the player stats
// as arguments for all players from a tournament's field.
// once we get those stats we go through each player and remove any
// stats for which no data exists.  once we are done doing so we
// create a new entry in the Players_Stats_Per_Tournament table.

  var tournament = JSON.parse(arr.stats).tournament;
// NOTE: this is tournament object.

  var tournament_id = tournament.tournamentNumber;

  var tourn_begin_date = date;
// NOTE: we want to keep track of the tournament date
// so we are able to consider stats from the past X weeks.

  var players = tournament.players;
// NOTE: players is an array of objects of each player.

  for (var i = 0; i < players.length; i++) {
// NOTE: go through each player in the array.
    var player_id = players[i].pid;
    var player_name = players[i].pn;
    var stats = players[i].stats;

// NOTE: get rid of any stats that dont have data.
    var non_empty_stats = stats.filter(stat => {
      if (stat.tValue) {
        return true;
      }
      return false;
    });

// NOTE: this is the obj we can send right to the db for creation.
    var obj_for_db = {
      tournament_id,
      player_id,
      player_name,
      stats: non_empty_stats,
      tourn_begin_date: date
    }
// NOTE: create the entry in the db.
    Players_Stats_Per_Tournament.create(obj_for_db)
      .then(res => console.log('Success'))
      .catch(err => 'Trouble in paradise');
  }
}

function find_tournament_by_id_AND_return_stats (tournament_id) {
// NOTE: this function returns all the data for the specific tournament_id

  return Weekly_Field_Stats.findOne({
    where: {tournament_id}
  })
  .then(res => {
    return res.dataValues;
  })
  .catch(err => console.error('Something wrong in find_tournament_by_id_AND_return_stats'));
}

function create_tournament_results_by_id (tournament_id) {
// NOTE: this function gets the tournament reuslts from the
// pga tour website based on the tournment id it is passed.
// it then creates the entry in the db for this specific tournament.

  var url = `http://www.pgatour.com/data/r/${tournament_id}/player_stats.json`;

  request_promise(url)
    .then(stats => {
      Weekly_Field_Stats.create({tournament_id, stats})
      .then(res => console.log('Ok, it was ok.'));
    })
    .catch(err => console.error('Nope, did not work'));
    return;
}
