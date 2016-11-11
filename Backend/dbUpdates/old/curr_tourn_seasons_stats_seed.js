const { Curr_Tourn, Players_Seasons_Stats } = require('../server/index');
const request_promise = require('request-promise');
const fs = require('fs');





// THIS FILE IS USELESS BECAUSE THE URL REQUEST GIVES NO USEFUL STATS.











/*
This file is used to update the Players_Seasons_Stats table in teh db
for the 2016 and 2017 seasons.

** Before you use it make sure the curr_tourns table is up to date.

*/


create_or_update_season_stats_in_db_table();

create_or_update_season_stats_in_db_table () {
// Search the table for the current pga id and year.  If it exists, we just updated
// the stats.  If it does not exist, create it.
// If the year is 2016, we know they don't exist already so create them.
// If the year is 2017 check if they exist to know if we should create or not.

  var players_with_seasons_stats = request_season_stats_from_pga_site();
  // players_with_seasons_stats is a Promise array of objects which look like:
  // var player_with_season_stats = {
  //   player_name: player.name,
  //   pga_site_id: player.pga_id,
  //   stats_year: year,
  //   season_stats: // SEASON STATS IS A PROMISE.
  // };
  players_with_seasons_stats // promise, we need to resolve it.
  .then(players_with_seasons_stats => {

    players_with_seasons_stats.forEach(player => {
// season_stats is a promise! wait for it.
      player.season_stats.then(stats => {

        player.season_stats = stats;

        if (player.stats_year !== 2017) {
// if the year is not equal to 2017, we are going to create a new entry in the table.
          Players_Seasons_Stats.create(player)
          .then(res => console.log(`${player.player_name} successfully created.`));
        } else {
          // Year = 2017.  Find out if the person already has stats for 2017.
          // If they do then do an update, otherwise create them for 2017.
          Players_Seasons_Stats.findOne({
            where: {
              pga_site_id: player.pga_site_id,
              stats_year: player.stats_year
            }
          })
          .then(res => {
            if (res) {
              // the entry exists, update the stat.
              res.update({season_stats: player.season_stats})
              .then(res => console.log(`${player.player_name} successfully update.`));
            } else {
// entry does not exist, create a new one.
              Players_Seasons_Stats.create(player)
              .then(res => console.log(`${player.player_name} successfully created.`));
            }
          });
        }
      });
    });
  })
  .catch(err => console.error(err));
}

function request_season_stats_from_pga_site () {
  var players_who_need_stats = get_player_list_who_need_stats();
  // players_who_need_stats is an array that contains objects that look like this:
  // {
  //   name: player_info.player_name,
  //   pga_id: player_info.pga_site_id,
  //   missing_stat_years: []
  // };

/*
The point of this function is to get the stats from the pga site for the players
who dont already have them.
*/

  // players_who_need_stats is a promise array that we need to wait to resolve
  // before we work on them.
  return players_who_need_stats
  .then(players_who_need_stats => {
    // Now that all players are resolved, let us request their season stats
    // for the necessary years from the pga site.

    var players_seasons_stats_array = [];
// players_seasons_stats_array will contain the stats to insert into the players_seasons_stats table.

    for (var i = 0; i < players_who_need_stats.length; i++) {
// loop throgh each player who needs stats

      player = players_who_need_stats[i];
// set a current player variable so we do not need to type that annoying long
// variable each time.

      player.missing_stat_years.forEach(year => {
// Iterate over the seasons for which this player needs stats,

        var url = `http://www.pgatour.com/data/players/${player.pga_id}/${year}results.json`;

        var season_stats = request_promise(url)
// request the stats from the pga site then and add the stats to the array to insert into the
        .then(stats => {
// succesfully hit the url, return the content from the page.
          return stats;
        })
        .catch(err => {
          console.error('error in url portion of request_season_stats_from_pga_site');
        })
// build the obj to send to the backend.
// NOTE season_stats IS STILL IN PROMISE FORM.  WE RESOLVE IT ABOVE.
        var player_with_season_stats = {
          player_name: player.name,
          pga_site_id: player.pga_id,
          stats_year: year,
          season_stats: season_stats
        };
// push the above object to the overall array.
        players_seasons_stats_array.push(player_with_season_stats);
      });
    }
    return players_seasons_stats_array;
  })
  .catch(err => console.error(err));
}

function get_player_list_who_need_stats () {
  /*
  THIS FUNCTION RETURNS AN ARRAY OF PROMISES.

  This function empowers us to look at player season stats for each Tournament
  over a number of seasons.  The point is to allow users to choose a range of time
  for a stastical evaluation.

  This function will return a list of players from the
  current tournament table that need season stats from the pga site
  for the year 2016.

  It does so by getting all players from the current Tournament table
  and then checking if their pga id exists in the players seasons stats table.

  ** We only need to check if their pga id exists because if it does then we have
  already pulled their 2016 pga stats from the site.

  We always want to refresh the stats for 2017 since they are being updated throughout
  the season, but the stats for 2016 are no longer changing, so we only need to  pull
  2016 stats for each player one time.
  */
  return Curr_Tourn.findAll() // get everything from the curr tournament table.
  .then(res => {
    const playerS = res;
    var playersToGetStatsFor = [];
    // Everyone gets the current year's stats.
    playersToGetStatsFor = playerS.map(player => {
      // check if 2016 stats exist.
      var player_info = player.dataValues;

      return do_stats_year_exist(player_info.pga_id, 2016)
// Does the player already have stats in the table for the year 2016?
      .then(res => {
// We set up the stats object to match the structure of the table in the db.
        var stats = {
          name: player_info.name,
          pga_id: player_info.pga_id,
          missing_stat_years: [2017] // everyone needs stats for 2017.
        };
        if (! res) {
// If the player does not have stats for year 2016
          stats.missing_stat_years.push(2016);
        }
        return stats;
      });
    });
    return Promise.all(playersToGetStatsFor);
  })
  .catch(err => console.error('error is get_player_list_who_need_stats'));
}
function do_stats_year_exist (pga_site_id, stats_year) {

  return Players_Seasons_Stats.findOne({
    // Find out if a player exists in the seasons stats table.
    where: {
      pga_site_id,
      stats_year,
      season_stats: {$ne: null}
    }
  }) // YOU COULD ALSO CHECK IF PLAYER EXISTS IN 2017 YEAR TOO AND THEN WE WOULD
    // KNOW IF WE SHOULD UPDATE OR CREATE LATER ON DOWN THE LINE.
  .then(res => {
    // Make an object with the player's name, pga_id and array of years they need stats for.

    if (! res) {
      // If they do not exist we need to get their stats for the year 2016.
      return false;
    }
    // console.log('stats ', stats);
    return true;
    // Push the current player to the total player stats array.
  });
}
