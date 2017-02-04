const { Weekly_Field_Stats, Players_Stats_Per_Tournament } = require('../data_base/index');
const request_promise = require('request-promise');

// NOTE: The point of this file is to pull the tournament results
// from the pga site for the previous week's tournament and add them to the db.  both the
// weekly stats table and the player stats per tournament table.
// before adding them to the player stats tournament we go through the stats and
// get rid of any stats that may have no data for them, because that does happen.

// NOTE: now when we pull from the players stats table we get a stats list that
// are guaranteed to have no blank stats, avoiding the concern for reporting
// false data where X% of players have a certain stat when in fact they dont have
// any data for that stat.

// NOTE: Make sure you have the server running before you run this.

// NOTE: this is the id of the tournament for the current week.
// you update this.
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
const id = '004';

// NOTE: this is the date of the tournament.
// you update this.
// **** months  go from 0 - 11 ****
// NOTE: we enter the date the tournament began.
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
const date = new Date(2017, 0, 26);

// NOTE: this runs the main function.
controller(id, date);

function controller (id, date) {
  create_tournament_results_by_id(id)
    .then(res => find_tournament_by_id_AND_return_stats(id))
    .then(res => create_player_stats_entries_for_tournament(res, date))
    .catch(err => console.error(err));
}

function create_player_stats_entries_for_tournament (arr, date) {

// NOTE: the point of this function is receive the player stats
// as arguments for all players from a tournament's field.
// once we get those stats we go through each player and remove any
// stats for which no data exists.  once we are done doing so we
// create a new entry in the Players_Stats_Per_Tournament table.

  let tournament_id = JSON.parse(arr.stats).tournament.tournamentNumber;

  let tourn_begin_date = date;
// NOTE: we want to keep track of the tournament date
// so we are able to consider stats from the past X weeks.

  let players = JSON.parse(arr.stats).tournament.players;
// NOTE: players is an array of objects of each player.

  for (let i = 0; i < players.length; i++) {
// NOTE: go through each player in the array.
    let player_id = players[i].pid;
    let player_name = players[i].pn;
    let stats = players[i].stats;

// NOTE: get rid of any stats that dont have data.
    let non_empty_stats = stats.filter(stat => {
      if (stat.tValue) return true;
      return false;
    });

// NOTE: this is the obj we can send right to the db for creation.
    let obj_for_db = {
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
  return Weekly_Field_Stats.findOne({where: {tournament_id}})
  .then(res => res.dataValues)
  .catch(err => console.error('Something wrong in find_tournament_by_id_AND_return_stats'));
}

function create_tournament_results_by_id (tournament_id) {
// NOTE: this function gets the tournament reuslts from the
// pga tour website based on the tournment id it is passed.
// it then creates the entry in the db for this specific tournament.

  let url = `http://www.pgatour.com/data/r/${tournament_id}/player_stats.json`;

  return request_promise(url)
    .then(stats => {
      return Weekly_Field_Stats.create({tournament_id, stats})
      .then(res => console.log('Ok, it was ok.'));
    })
    .catch(err => console.error('Nope, did not work'));
}
