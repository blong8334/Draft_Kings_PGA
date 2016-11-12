const { get_stats_for_last_x_weeks } = require('./contest_player_list_with_all_stats');


function stats_for_last_x_weeks_with_analysis (field, weeks) {
  var arr = get_stats_for_last_x_weeks(field, weeks);
  arr = analyze_stats(arr);
  return arr;
}

function analyze_stats (field) {
  // this functino will return an obj with the statId as the key:
  // the properties will be an object as follows:
  // {
  //   statName: ,
  //   players_with_this_stat: ,
  //   pct_of_field:
  // }

  // players_with_this_stat will be an object with the player id
  // as the key and the properties will be the tournament_id for which the player
  // has this stat, and will incliude their actual stats so we can use them later.

  // need to loop through each player in field.
  // then loop through each stat array in stats.
  // for each stat check if it exists in the main
  var total_players_in_field = field.length;
  var stat_obj = {};

  // NOTE: loop through each player in the field.
  field.forEach(player => {
    // NOTE: now loop through all the stats for this player.

    player.stats.forEach(stat => {
      // NOTE: check if the statId exists in the main stat_obj.
      // stat has tournament_id, date and a stats array
      stat.stats.forEach(indStat => {

        indStat.tourn_id = stat.tournament_id;

        if (! stat_obj[indStat.statId]) {

          var players_with_this_stat_obj = {};
          players_with_this_stat_obj[player.pga_id] = [indStat];

          stat_obj[indStat.statId] = {
            stat_name: indStat.name,
            players_with_this_stat: players_with_this_stat_obj,
            total_in_field: 1
          }
        } else {
          var x = stat_obj[indStat.statId].players_with_this_stat[player.pga_id];
          if (x) {
            x.push(indStat);
          } else {
            stat_obj[indStat.statId].players_with_this_stat[player.pga_id] = [indStat];
            stat_obj[indStat.statId].total_in_field ++;
          }
        }
      })
    })
  })
  return stat_obj;
}

function reduce_all_stats_to_one (arr) {

  // NOTE: the purpose of this function is to get all stats for
  // a certain number of weeks and combine them into one total for the
  // z score function to make use of.

  for (var i = 1; i < 2; i++) {
    var curr = arr[i];
    var stats = curr.stats;

    console.log('PLAYER: ', curr);

    var updatedStats = {};

    stats.forEach(stat_bank => {
      console.log(stat_bank.tournament_id);
      console.log(stat_bank.date);
      console.log('STATS: ', stat_bank.stats);
      var combinedStats = actually_combine_the_stats(updatedStats, stat_bank.stats);

    })

  }

}
function actually_combine_the_stats (combined_stats, stats_arr) {
  // we need to first figure out how the stat is calculated.
  // once we know how it's calculated, add it

  // check if:
  //   Total,
  //   percentage => uses cValue,
  //   Average,
  //   maximum,

  // combined stats will be an object where the statId is the key.

  // the properties will be:
  // {
  // name: 'Putts Per Round',
  // cValue: '',
  // rounds:
  // [ { r: '1', rValue: '35.00', cValue: '' },
  // { r: '2', rValue: '31.00', cValue: '' },
  // { r: '3', rValue: '30.00', cValue: '' },
  // { r: '4', rValue: '29.00', cValue: '' } ] }

  stats_arr.forEach(stat => {
    console.log(stat);
  })
}
module.exports = {
  stats_for_last_x_weeks_with_analysis
};
