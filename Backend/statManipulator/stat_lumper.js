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

  // NOTE: the purpose of this function is to receive an array of stats
  // to group together into one for each player because players may have more than
  // one stat considering the multiple tourn selection.

  // arr will be an array of objects of the form:
  // { stat_name: 'SG: Total',
  // players_with_this_stat:
  //  { '12510': [Object],
  //    '12716': [Object],
  //    '19846': [Object],
  //  '01320': [Object] },
  // total_in_field: 113 } ]

  // console.log(arr);

  arr.forEach((statGroup, index) => {
    // NOTE: this is the individual stat group.

    // NOTE: these are the keys.
    var stat_name = statGroup.stat_name;
    console.log(stat_name);
    var total_in_field = statGroup.total_in_field;
    var player_stat = statGroup.players_with_this_stat;

    for (var pga_id in player_stat) {
      if (player_stat[pga_id].length > 1) {
        // call the reducer;
        // console.log('INSIDE');
        player_stat[pga_id] = actually_combine_the_stats(player_stat[pga_id]);
      } else {

        var rounds = player_stat[pga_id];

        var toReturn = {
          statId: rounds[0].statId,
          name: rounds[0].name,
          tValue: rounds[0].tValue,
          rank: [],
        }

        toReturn.rank.push({
            rank: rounds[0].rank,
            value: rounds[0].tValue,
            tourn_id: rounds[0].tourn_id
          });
          player_stat[pga_id] = toReturn;
        }
        // else we are fine, no changes are necessary.
      }
    });
    // arr.forEach(thing => {
    //   for (var key in thing.players_with_this_stat) {
    //     if (thing.players_with_this_stat[key].length > 1) {
    //       console.log(thing[key]);
    //     }
    //
    //   }
    // })
    return arr;
  }
  function actually_combine_the_stats (stat_arr) {
    // we need to first figure out how the stat is calculated.
    // once we know how it's calculated, add it

    // check if:
    //   Total,
    //   percentage => uses cValue,
    //   Average,
    //   maximum,

    // console.log('inside actually_combine_the_stats');

    // NOTE: PCT HANDLER!!!!
    if (stat_arr[0].cValue) {
      // console.log('stat is a percentage');
      return pctCalculator(stat_arr);
    }
    // console.log(stat_arr);
    var x = totalChecker(stat_arr);
    // console.log('x ', x);
    if (x) {
      // console.log('x ', x);
      return x;
    }

    var y = averageCalculator(stat_arr);
    if (y) {
      return y;
    }
    // console.log('STAT ARR ', stat_arr);

    // NOTE: if the stat is calculated as a total, we need to take
    // the total per round since if some people miss the cut they will have less than
    // 4 rounds.

    // if the stat is an average of all round then it doesnt matter, just average everything.

    // if the stat is a max, just find the max of all the rounds.
    console.log('stat is being a brat and is not a total, avg or pct.');
    throw new Error('This stat is not correct');
    return;

  }
  function averageCalculator (rounds) {

    var tempTotal = 0; // NOTE: this will be the placeholder total for the average calculation.
    // we will reset this after each round.
    var tempTotalRounds = 0;

    var pgaTotal = 0; // NOTE: this will be the sum of the tValue as we loop through.

    var ourAverageTotal = 0; // NOTE: this will be the running total of the averages we calculate.

    var ourTotal = 0; // NOTE: this will hold the total of everything we calculate so we can return
    var ourTotalRounds = 0; // NOTE: this is the global total rounds.
    // the average once we are done.

    var toReturn = {
      statId: rounds[0].statId,
      name: rounds[0].name,
      tValue: '',
      rank: [],
    }

    rounds.forEach(tourn => {

      console.log(tourn.tValue);

      toReturn.rank.push({
        rank: tourn.rank,
        value: tourn.tValue,
        tourn_id: tourn.tourn_id
      });

      pgaTotal += parseFloat(tourn.tValue);

      tourn.rounds.forEach(round => {
        tempTotalRounds ++;
        tempTotal += parseFloat(round.rValue);
      });

      ourAverageTotal += tempTotal / tempTotalRounds;

      ourTotal += tempTotal;
      ourTotalRounds += tempTotalRounds;

      tempTotal = 0;
      tempTotalRounds = 0;

    });

    var calcDifference = pgaTotal - ourAverageTotal;

    if (Math.abs(calcDifference) < 0.2) {
      // IDEA: even if this stat is displayed as a total, we want to consider the average
      // since some players compete in more tournaments than others.  it would skew the calculation
      // if we were considering totals.  players that compete more often are not necessarily better players.
      toReturn.tValue = ourTotal / ourTotalRounds;
      return toReturn;
    }
    return false;
  }
  function totalChecker (rounds) {
    var total = 0; // NOTE: this will be the sum of the stats value as we loop through.
    var majorTotal = 0; // NOTE: this will be the sum of the tValue as we loop through.
    // we will compare out calculation to this number.
    var totalRounds = 0; // NOTE: a count of the total rounds for which this player has stats.
    var toReturn = {
      statId: rounds[0].statId,
      name: rounds[0].name,
      tValue: '',
      rank: [],
    }

    rounds.forEach(tourn => {
      console.log('tourn.tValue ', tourn.tValue);
      toReturn.rank.push({
        rank: tourn.rank,
        value: tourn.tValue,
        tourn_id: tourn.tourn_id
      });
      majorTotal += parseFloat(tourn.tValue);
      tourn.rounds.forEach(round => {
        totalRounds ++;
        console.log('round.rValue ',round.rValue);
        total += parseFloat(round.rValue);
      })
    })
    var calcDifference = majorTotal - total;

    if (calcDifference === 0) {
      // IDEA: even if this stat is displayed as a total, we want to consider the average
      // since some players compete in more tournaments than others.  it would skew the calculation
      // if we were considering totals.  players that compete more often are not necessarily better players.

      toReturn.tValue = total / totalRounds;
      return toReturn;
    }
    return false;
  }

  function pctCalculator (rounds) {

    var numerator = 0;
    var denominator = 0;

    var toReturn = {
      statId: rounds[0].statId,
      name: rounds[0].name, // NOTE: this is the stat name.
      tValue: '', // NOTE: we are building tValue from the numbers for all the rounds.
      rank: [], // NOTE: rank is an array of all the rounds that went into the calculation.
    }

    rounds.forEach(round => {
      var guy = round.cValue.split('/');
      numerator += +guy[0];
      denominator += +guy[1];
      toReturn.rank.push({
        rank: round.rank,
        value: round.cValue,
        tourn_id: round.tourn_id
      });
    })
    var final = numerator / denominator;
    toReturn.tValue = final * 100;
    // console.log(toReturn);
    return toReturn;
  }

  module.exports = {
    stats_for_last_x_weeks_with_analysis,
    reduce_all_stats_to_one
  };
