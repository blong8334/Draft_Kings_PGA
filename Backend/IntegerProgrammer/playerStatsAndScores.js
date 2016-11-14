const { db, Player_Table, DK_Table, Curr_Tourn } = require('../data_base/index');
const fs = require('fs');

function getPlayerZscores (stats, field) {

  // NOTE: check out zScoreReturnObjHelper function for what field looks like

  // NOTE: stats looks like this:
  // Array[2] =>
  // 0: Object =>
  // players_with_this_stat: Object
  // stat_name: "Driving Distance Avg"
  // total_in_field: 113

  // players_with_this_stat is an object with keys being the player's pga id
  // the properties look like this:
  // name: "Driving Distance Avg"
  // rank: Array[1]
  // statId: "101"
  // tValue: "304.7"

  // rank looks like this:
  // 0: Object =>
  // rank: "" // or this will contain an actual rank.
  // tourn_id:47
  // value:"304.7"

  // NOTE: rank will be used to determine whether a stat is better to be high or low.

  var allPlayerArr = zScoreReturnObjHelper(field);
  // allPlayerArr is an array of objects with these properties:
  //   player_name: player.player_name,
  //   pga_id: player.pga_id,
  //   salary: player.dk_salary,
  //   zscore: 0,
  //   i_had_stats_for: [] // an array of stat id's

  // now we need to go through each stat and calculate all its stuff so
  // we can hand out z-scores like candies.
  stats.forEach(stat => {
    // NOTE: we are going through each stat the user chose to start building z scores
    var stat_name = stat.stat_name;
    var players_with_this_stat = stat.players_with_this_stat;

    var meanAndHighOrLow = meanCalc (players_with_this_stat);

    var mean = meanAndHighOrLow.mean;
    var betterToBeHigh = meanAndHighOrLow.betterToBeHigh;
    console.log('mean ', mean);
    console.log('betterToBeHigh ', betterToBeHigh);
    var stdDev = stdDevCalc(players_with_this_stat, mean);
    console.log('stdDev ', stdDev);
    var highMx = 1;
    if (betterToBeHigh === undefined) {
      throw new Error('Something is wrong with this stat')
    }
    if (! betterToBeHigh) {
      highMx = -1;
    }

    for (var pga_id in players_with_this_stat) {
      var stat = parseFloat(players_with_this_stat[pga_id].tValue);
      if (isNaN(stat)) {
        return;
      }
      var zscore = (stat - mean) / stdDev * highMx;
      updateZscore(allPlayerArr, zscore, pga_id, players_with_this_stat[pga_id].statId);
    }
  });
  return allPlayerArr;
}
function updateZscore (allPlayerArr, zscore, pga_id, statId) {
  for (var i = 0; i < allPlayerArr.length; i++) {
    if (allPlayerArr[i].pga_id === pga_id) {
      allPlayerArr[i].zscore += zscore;
      allPlayerArr[i].i_had_stats_for.push(statId);
      return;
    }
  }
}
function stdDevCalc (arr, mean) {
  // arr is an array of obj's with these properties:
  // name: "Driving Distance Avg"
  // rank: Array[1]
  // statId: "101"
  // tValue: "304.7"
  var total = 0;
  var count = 0;
  for (var key in arr) {
    var value = parseFloat(arr[key].tValue);
    if (isNaN(value)) {
      return;
    }
    count ++;
    var sqrDiff = Math.pow(value - mean, 2);
    total += sqrDiff;
  }
  return Math.pow(total/count, 0.5);
}
function meanCalc (arr) {
  // arr is an array of obj's with these properties:
  // name: "Driving Distance Avg"
  // rank: Array[1]
  // statId: "101"
  // tValue: "304.7"
  var total = 0;
  var betterToBeHigh;
  var weKnowIfItsBetter = false;
  var tempRank;
  var count = 0;
  var rankObj = {
    // tourn_id: {
    //   value: '',
    //   rank: ''
    // }
  };

  for (var key in arr) {
    var obj = arr[key];

    var value = parseFloat(obj.tValue);
    if (isNaN(value)) {
      return;
    }
    count ++;
    total += value;
    if (! weKnowIfItsBetter) {
      // go through each rank in the current player and add it to the
      // rank obj.  then for each following player we can check if the rank
      // exists in the obj and then compare their value and we can figure it out.

      // rank is an array of obj's with these properties:
      // rank: "" // or this will contain an actual rank.
      // tourn_id:47
      // value:"304.7"

      obj.rank.forEach(curr => {

        if (! rankObj[curr.tourn_id] && curr.rank) {
          // NOTE: if the id doesnt exist in the rankObj and curr.rank is not empty

          var ranker = parseFloat(curr.rank);

          // NOTE: cause there was a t in the front of the rank.
          if (isNaN(ranker)) {
            ranker = parseFloat(curr.rank.slice(1));
          }

          rankObj[curr.tourn_id] = {
            value: parseFloat(curr.value),
            rank: ranker
          };
          // console.log('rankObj ', rankObj);

        } else if (curr.rank) {
          var currRank = parseFloat(curr.rank);
          var currValue = parseFloat(curr.value);
          // NOTE: because there is sometimes a t as the first letter when people tie.
          if (isNaN(currRank)) {
            currRank = parseFloat(curr.rank.slice(1));
          }
          console.log('tourn: ', curr.tourn_id);
          console.log('currRank ', currRank);
          console.log('currValue ', currValue);
          console.log('rankObj ', rankObj);

          if (currValue !== rankObj[curr.tourn_id].value) {
            console.log('inside');
            var currIsHigherThanRef =  currValue > rankObj[curr.tourn_id].value;
            console.log('curr value higher ref', currIsHigherThanRef);
            var currRankIsLowerThanRef = currRank < rankObj[curr.tourn_id].rank;
            console.log('curr rank lower ref', currRankIsLowerThanRef);

            if (currIsHigherThanRef === currRankIsLowerThanRef) {
              betterToBeHigh = true;
            } else {
              betterToBeHigh = false;
            }
            weKnowIfItsBetter = true;
          }
        }
      });
    }
  }
  var mean = total / count;
  return {mean, betterToBeHigh};
}
function zScoreReturnObjHelper (field) {
  // NOTE: returns an object that makes zscore pleased.

  // field is an array of objects with the following form:
  // Object
  // dk_salary:10200
  // pga_id:"10809"
  // player_name:"Furyk, Jim"
  // stats:Array[0]
  var retArr = field.map(player => {
    return {
      player_name: player.player_name,
      pga_id: player.pga_id,
      salary: player.dk_salary,
      zscore: 0,
      i_had_stats_for: [] // an array of stat id's
    };
  });
  return retArr;
}



module.exports = { getPlayerZscores };

// function statListForSelectedStats (selectedStats) {
//   return DK_Table.findAll()
//   .then(res => {
//     var builtStatsObj = {noStats: [], statCount: 0};
//     var playerCount = 0;
//
//     res.forEach(respy => {
//       var mookie = respy.dataValues;
//       /*
//       mookie keys:
//       [ 'id',
//       'dk_salary',
//       'first_name',
//       'last_name',
//       'stats',
//       'createdAt',
//       'updatedAt',
//       'currTournId' ]
//       */
//       //MOOKIE IS THE TABLE ROW FROM THE DB
//       try {
//         if (! mookie.stats) {
//           throw 'No stats';
//         }
//
//         var player = JSON.parse(mookie.stats);
//         // fs.write(__dirName )
//         var statsArr = player.plrs[0].years[0].tours[0].statCats
//         // each el of statsArr is an object with keys catName and then the stats
//         // stats is an array of objects for the individual stat
//         /*
//         { statID: '02567',
//         name: 'SG: Off-the-Tee',
//         value: '.378',
//         rank: '999',
//         projRank: '35',
//         additionals: [Object] }
//         */
//         // we will make an object with the key being the statId,
//         // the values will be the stat name and an array of players
//         // for which the stat exists.
//         playerCount ++;
//         statsArr.forEach(subStatCat => {
//           // console.log(subStatCat);
//           subStatCat.stats.forEach(stattyBoy => {
//
//             var currID = stattyBoy.statID;
//             // console.log(stattyBoy)
//
//             if (selectedStats.indexOf(currID) === -1) {
//               // console.log('inside');
//               return;
//             }
//             if (builtStatsObj[stattyBoy.statID]) {
//               if (builtStatsObj[stattyBoy.statID].playerIds.indexOf(mookie.id) === -1) {
//                 builtStatsObj[stattyBoy.statID].players.push({
//                   id: mookie.id,
//                   salary: mookie.dk_salary,
//                   first_name: mookie.first_name,
//                   last_name: mookie.last_name,
//                   stat_detail: stattyBoy
//                 });
//                 builtStatsObj[stattyBoy.statID].count += 1;
//                 builtStatsObj[stattyBoy.statID].playerIds.push(mookie.id);
//               } else {
//                 // console.log('we actually did have a repeat');
//               }
//             } else {
//               builtStatsObj[stattyBoy.statID] = {
//                 name: stattyBoy.name,
//                 players: [{
//                   id: mookie.id,
//                   salary: mookie.dk_salary,
//                   first_name: mookie.first_name,
//                   last_name: mookie.last_name,
//                   stat_detail: stattyBoy
//                 }],
//                 count: 1,
//                 playerIds: [mookie.id]
//               };
//               builtStatsObj.statCount ++;
//             }
//           })
//         })
//       } catch (e) {
//         console.log('No stats available for: ', mookie.last_name);
//         builtStatsObj.noStats.push({
//           player_name: mookie.last_name+', '+mookie.first_name,
//           salary: mookie.dk_salary,
//           id: mookie.id,
//           zscore: 0
//         });
//       }
//     });
//     builtStatsObj.totalPlayers = playerCount;
//     return builtStatsObj;
//   });
// }
//
// var getStats = function () {
//   statList().then(res => {
//     var totalPlayers = res.totalPlayers;
//     for (var key in res) {
//       var curr = res[key];
//       if (! curr.count) {
//         continue;
//       }
//       // console.log(typeof key);
//       console.log(key);
//       console.log(curr.name, curr.count,':', curr.count / totalPlayers );
//     }
//     console.log('Players with stats: ', totalPlayers);
//     console.log('Total players in field: ', totalPlayers  + res.noStats.length);
//     console.log('Total # of stats: ', res.statCount);
//   });
// }
// function statList () {
//   return DK_Table.findAll()
//   .then(res => {
//     var totalStatCount = {noStats: [], statCount: 0};
//     var playerCount = 0;
//     res.forEach(respy => {
//       var mookie = respy.dataValues;
//       /*
//       mookie keys:
//       [ 'id',
//       'dk_salary',
//       'first_name',
//       'last_name',
//       'stats',
//       'createdAt',
//       'updatedAt',
//       'currTournId' ]
//       */
//       try {
//         if (! mookie.stats) {
//           throw 'No stats';
//         }
//         var player = JSON.parse(mookie.stats);
//         var statsArr = player.plrs[0].years[0].tours[0].statCats
//         // each el of statsArr is an object with keys catName and then the stats
//         // stats is an array of objects for the individual stat
//         /*
//         { statID: '02567',
//         name: 'SG: Off-the-Tee',
//         value: '.378',
//         rank: '999',
//         projRank: '35',
//         additionals: [Object] }
//         */
//         // we will make an object with the key being the statId,
//         // the values will be the stat name and an array of players
//         // for which the stat exists.
//         playerCount ++;
//         statsArr.forEach(subStatCat => {
//           // console.log(subStatCat);
//           subStatCat.stats.forEach(stattyBoy => {
//             if (totalStatCount[stattyBoy.statID]) {
//               if (totalStatCount[stattyBoy.statID].players.indexOf(mookie.id) === -1) {
//                 totalStatCount[stattyBoy.statID].players.push(mookie.id);
//                 totalStatCount[stattyBoy.statID].count += 1;
//               }
//             } else {
//               totalStatCount[stattyBoy.statID] = {
//                 name: stattyBoy.name,
//                 players: [mookie.id],
//                 count: 1
//               };
//               totalStatCount.statCount ++;
//             }
//           })
//         })
//         // player is array with
//       } catch (e) {
//         console.log('No stats available for: ', mookie.last_name);
//         totalStatCount.noStats.push(mookie);
//       }
//     });
//     totalStatCount.totalPlayers = playerCount;
//     return totalStatCount;
//   });
// }
