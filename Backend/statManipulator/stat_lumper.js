const { get_stats_for_last_x_weeks } = require('./contest_player_list_with_all_stats');

function reduce_all_stats_to_one (arr) {

  arr.forEach((statGroup, index) => {

    let stat_name = statGroup.stat_name,
    total_in_field = statGroup.total_in_field,
    player_stat = statGroup.players_with_this_stat;

    for (let pga_id in player_stat) {
      // If the players has more than one tournament, we need to combine the stats.
      if (player_stat[pga_id].length > 1) {
        // Send to the combiner
        player_stat[pga_id] = actually_combine_the_stats(player_stat[pga_id]);

      } else {

        let rounds = player_stat[pga_id];

        let toReturn = {
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
  return arr;
}
function actually_combine_the_stats (stat_arr) {
  // we need to first figure out how the stat is calculated.
  // once we know how it's calculated, add it

  // check if:
  //   Total,
  //   percentage => uses cValue,
  //   Average,
  //   maximum, WE HAVE NOT IMPLEMENTED YET.

  if (stat_arr[0].cValue) {
    console.log('Stat is a percentage.');
    return pctCalculator(stat_arr);
  }

  let x = totalChecker(stat_arr);
  if (x) {
    console.log('Stat is a total.');
    return x;
  }

  let y = averageCalculator(stat_arr);
  if (y) {
    console.log('Stat is an average.');
    return y;
  }

  // NOTE: if the stat is calculated as a total, we need to take
  // the total per round since if some people miss the cut they will have less than
  // 4 rounds.

  // if the stat is an average of all round then it doesnt matter, just average everything.

  // if the stat is a max, just find the max of all the rounds.

  throw new Error("We don't know how to analyze this stat (yet).");

}
function averageCalculator (rounds) {

  let tempTotal = 0; // NOTE: this will be the placeholder total for the average calculation.
  // we will reset this after each round.
  let tempTotalRounds = 0;

  let pgaTotal = 0; // NOTE: this will be the sum of the tValue as we loop through.

  let ourAverageTotal = 0; // NOTE: this will be the running total of the averages we calculate.

  let ourTotal = 0; // NOTE: this will hold the total of everything we calculate so we can return
  let ourTotalRounds = 0; // NOTE: this is the global total rounds.
  // the average once we are done.

  let toReturn = {
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

  let calcDifference = pgaTotal - ourAverageTotal;

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
  let total = 0; // NOTE: this will be the sum of the stats value as we loop through.
  let tournamentValue = 0; // NOTE: this will be the sum of the tValue as we loop through.
  // we will compare out calculation to this number.
  let totalRounds = 0; // NOTE: a count of the total rounds for which this player has stats.
  let toReturn = {
    statId: rounds[0].statId,
    name: rounds[0].name,
    tValue: '',
    rank: [],
  }

  rounds.forEach(tourn => {
    console.log('Tournmanent value: ', tourn.tValue);
    toReturn.rank.push({
      rank: tourn.rank,
      value: tourn.tValue,
      tourn_id: tourn.tourn_id
    });
    tournamentValue += parseFloat(tourn.tValue);
    tourn.rounds.forEach(round => {
      if (! round.rValue) {
        return;
      }
      console.log('round.rValue ',round.rValue);
      totalRounds ++;
      total += parseFloat(round.rValue);
    });
  });
  console.log(tournamentValue, total);
  let calcDifference = tournamentValue - total;
  console.log('CALC DIFFERENCE: ', calcDifference);
  if (calcDifference < 0.2) {
    // IDEA: even if this stat is displayed as a total, we want to consider the average
    // since some players compete in more tournaments than others.  it would skew the calculation
    // if we were considering totals.  players that compete more often are not necessarily better players.

    toReturn.tValue = total / totalRounds;
    return toReturn;
  }
  return false;
}

function pctCalculator (rounds) {
  let numerator = 0, denominator = 0,
  toReturn = {
    statId: rounds[0].statId,
    name: rounds[0].name, // NOTE: this is the stat name.
    tValue: '', // NOTE: we are building tValue from the numbers for all the rounds.
    rank: [], // NOTE: rank is an array of all the rounds that went into the calculation.
  };
  rounds.forEach(round => {
    let guy = round.cValue.split('/');
    numerator += +guy[0];
    denominator += +guy[1];
    toReturn.rank.push({
      rank: round.rank,
      value: round.cValue,
      tourn_id: round.tourn_id
    });
  })
  let final = numerator / denominator;
  toReturn.tValue = final * 100;
  return toReturn;
}

module.exports = {reduce_all_stats_to_one};
