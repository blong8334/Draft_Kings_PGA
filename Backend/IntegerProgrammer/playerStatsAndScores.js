const { db, Player_Table, DK_Table, Curr_Tourn } = require('../data_base/index');
const fs = require('fs');

var getPlayerZscores = function (statids) {
  return statListForSelectedStats(statids)
  .then(res => {
    console.log(res);
    return DK_Table.findAll()
    .then(resper => {

      var allPlayerArr = [];
      resper.forEach(marick => {
        var player = marick.dataValues;
        var player_name = player.last_name+', '+player.first_name;
        var salary = player.dk_salary;

        if (! player.dk_salary) {
          return;
        }

        var zscore = 0;
        var id = player.id;
        allPlayerArr[id] = {player_name, salary, id, zscore}
      });
      var count = 0;
      var scoreArr = [];

      for (var key in res) {
        count ++;
        var mooker = res[key];
        if (! mooker.name) {
          continue;
        }
        // need to get the mean, then the standard deviation, then calc the z-score
        // also need to figure if it's a stat where it's better to be high or low.
        var meanAndHighOrLow = meanCalc (mooker.players);
        var mean = meanAndHighOrLow.mean;
        var betterToBeHigh = meanAndHighOrLow.betterToBeHigh;
        var stdDev = stdDevCalc(mooker.players, mean);
        // x - mean / stdDev

        // key in score arr is player id
        // have properties for name, salary and score.
        var highMx = 1;
        if (! betterToBeHigh) {
          highMx = -1;
        }
        mooker.players.forEach(player => {
          var stat = parseFloat(player.stat_detail.value);
          if (isNaN(stat)) {
            return;
          }
          var zscore = (stat - mean) / stdDev * highMx;
          var id = player.id;
            allPlayerArr[id].zscore += zscore;
        });
      }
      allPlayerArr.shift();
      return allPlayerArr;
    });
  });
}



function stdDevCalc (arr, mean) {
  var total = 0;
  var count = 0;
  arr.forEach(el => {
    var value = parseFloat(el.stat_detail.value);
    if (isNaN(value)) {
      return;
    }
    count ++;
    var sqrDiff = Math.pow(value - mean, 2);
    total += sqrDiff;
  })
  return Math.pow(total/count, 0.5);
}
function meanCalc (arr) {
  var total = 0;
  var betterToBeHigh;
  var figuredStat = false;
  var tempRank;
  var count = 0;
  arr.forEach(obj => {
    var value = parseFloat(obj.stat_detail.value);
    if (isNaN(value)) {
      return;
    }
    count ++;
    total += value;
    if (! figuredStat) {
      var rank = +obj.stat_detail.rank;
      if (! tempRank && rank !== 999) {
        tempRank = {rank, value}
      } else if (rank !== 999) {
        if (value < tempRank.value && rank < tempRank.rank) {
          betterToBeHigh = false;
        } else {
          betterToBeHigh = true;
        }
        figuredStat = true;
      }
    }
  });
  var mean = total / count;
  return {mean, betterToBeHigh};
}
function statListForSelectedStats (selectedStats) {
  return DK_Table.findAll()
  .then(res => {
    var builtStatsObj = {noStats: [], statCount: 0};
    var playerCount = 0;

    res.forEach(respy => {
      var mookie = respy.dataValues;
      /*
      mookie keys:
      [ 'id',
      'dk_salary',
      'first_name',
      'last_name',
      'stats',
      'createdAt',
      'updatedAt',
      'currTournId' ]
      */
      //MOOKIE IS THE TABLE ROW FROM THE DB
      try {
        if (! mookie.stats) {
          throw 'No stats';
        }

        var player = JSON.parse(mookie.stats);
        // fs.write(__dirName )
        var statsArr = player.plrs[0].years[0].tours[0].statCats
        // each el of statsArr is an object with keys catName and then the stats
        // stats is an array of objects for the individual stat
        /*
        { statID: '02567',
        name: 'SG: Off-the-Tee',
        value: '.378',
        rank: '999',
        projRank: '35',
        additionals: [Object] }
        */
        // we will make an object with the key being the statId,
        // the values will be the stat name and an array of players
        // for which the stat exists.
        playerCount ++;
        statsArr.forEach(subStatCat => {
          // console.log(subStatCat);
          subStatCat.stats.forEach(stattyBoy => {

            var currID = stattyBoy.statID;
            // console.log(stattyBoy)

            if (selectedStats.indexOf(currID) === -1) {
              // console.log('inside');
              return;
            }
            if (builtStatsObj[stattyBoy.statID]) {
              if (builtStatsObj[stattyBoy.statID].playerIds.indexOf(mookie.id) === -1) {
                builtStatsObj[stattyBoy.statID].players.push({
                  id: mookie.id,
                  salary: mookie.dk_salary,
                  first_name: mookie.first_name,
                  last_name: mookie.last_name,
                  stat_detail: stattyBoy
                });
                builtStatsObj[stattyBoy.statID].count += 1;
                builtStatsObj[stattyBoy.statID].playerIds.push(mookie.id);
              } else {
                // console.log('we actually did have a repeat');
              }
            } else {
              builtStatsObj[stattyBoy.statID] = {
                name: stattyBoy.name,
                players: [{
                  id: mookie.id,
                  salary: mookie.dk_salary,
                  first_name: mookie.first_name,
                  last_name: mookie.last_name,
                  stat_detail: stattyBoy
                }],
                count: 1,
                playerIds: [mookie.id]
              };
              builtStatsObj.statCount ++;
            }
          })
        })
      } catch (e) {
        console.log('No stats available for: ', mookie.last_name);
        builtStatsObj.noStats.push({
          player_name: mookie.last_name+', '+mookie.first_name,
          salary: mookie.dk_salary,
          id: mookie.id,
          zscore: 0
        });
      }
    });
    builtStatsObj.totalPlayers = playerCount;
    return builtStatsObj;
  });
}

var getStats = function () {
  statList().then(res => {
    var totalPlayers = res.totalPlayers;
    for (var key in res) {
      var curr = res[key];
      if (! curr.count) {
        continue;
      }
      // console.log(typeof key);
      console.log(key);
      console.log(curr.name, curr.count,':', curr.count / totalPlayers );
    }
    console.log('Players with stats: ', totalPlayers);
    console.log('Total players in field: ', totalPlayers  + res.noStats.length);
    console.log('Total # of stats: ', res.statCount);
  });
}
function statList () {
  return DK_Table.findAll()
  .then(res => {
    var totalStatCount = {noStats: [], statCount: 0};
    var playerCount = 0;
    res.forEach(respy => {
      var mookie = respy.dataValues;
      /*
      mookie keys:
      [ 'id',
      'dk_salary',
      'first_name',
      'last_name',
      'stats',
      'createdAt',
      'updatedAt',
      'currTournId' ]
      */
      try {
        if (! mookie.stats) {
          throw 'No stats';
        }
        var player = JSON.parse(mookie.stats);
        var statsArr = player.plrs[0].years[0].tours[0].statCats
        // each el of statsArr is an object with keys catName and then the stats
        // stats is an array of objects for the individual stat
        /*
        { statID: '02567',
        name: 'SG: Off-the-Tee',
        value: '.378',
        rank: '999',
        projRank: '35',
        additionals: [Object] }
        */
        // we will make an object with the key being the statId,
        // the values will be the stat name and an array of players
        // for which the stat exists.
        playerCount ++;
        statsArr.forEach(subStatCat => {
          // console.log(subStatCat);
          subStatCat.stats.forEach(stattyBoy => {
            if (totalStatCount[stattyBoy.statID]) {
              if (totalStatCount[stattyBoy.statID].players.indexOf(mookie.id) === -1) {
                totalStatCount[stattyBoy.statID].players.push(mookie.id);
                totalStatCount[stattyBoy.statID].count += 1;
              }
            } else {
              totalStatCount[stattyBoy.statID] = {
                name: stattyBoy.name,
                players: [mookie.id],
                count: 1
              };
              totalStatCount.statCount ++;
            }
          })
        })
        // player is array with
      } catch (e) {
        console.log('No stats available for: ', mookie.last_name);
        totalStatCount.noStats.push(mookie);
      }
    });
    totalStatCount.totalPlayers = playerCount;
    return totalStatCount;
  });
}
module.exports = { getStats, getPlayerZscores };
