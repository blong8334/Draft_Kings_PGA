const { getPlayerZscores } = require('./playerStatsAndScores');
const { simplexer } = require('./tableauMaker');

var statids = ['102', '103', '104', '107', '108', '103', '482', '02672'];
var cap = 50000;
var totalPlayerCount = 6;

// Initiate the solver.
findIt(statids, cap, totalPlayerCount)

function findIt (statids, cap, totalPlayerCount) {
  getPlayerZscores(statids)
    .then(res => {
      // console.log(res);
      var morlanock = getBestLineup(res, cap, totalPlayerCount);
      console.log('This is the best: ', morlanock);
    })
    .catch(err => {
      console.error(err);
    });
}

function getBestLineup (players, cap, totalPlayerCount) {
  var bestLineup = {
    totalSal: null,
    totalZScore: null,
    lineup: []
  };
  var count = 0;
  var currLineup = {
    totalSal: 0,
    totalZScore: 0,
    lineup: []
  };
  branchAndBound(players, currLineup, cap, totalPlayerCount);
  return bestLineup;

  function branchAndBound (currPlayerList, currLineup, currCap, remainingPlayers) {
    if (currPlayerList.length + currLineup.lineup.length < totalPlayerCount) {
      return;
    }

    var addThePlayerLineup = Object.assign({}, currLineup);
    var nextPlayer = currPlayerList.shift();

    addThePlayerLineup.lineup = currLineup.lineup.slice();
    addThePlayerLineup.lineup.push(nextPlayer);
    addThePlayerLineup.totalSal += +nextPlayer.salary;
    addThePlayerLineup.totalZScore += +nextPlayer.zscore;

    var copiedPlayerList = currPlayerList.slice();
    var nextCap = currCap - nextPlayer.salary;
    var nextRemainingPlayers = remainingPlayers - 1;

    // Is this new lineup still valid?
    var stillValid = true;
    if (nextCap < 0) {
      stillValid = false;
    } else if (nextRemainingPlayers === 0) {
      // we have a valid lineup.
      // check if it is the best.
      if (addThePlayerLineup.totalZScore > bestLineup.totalZScore) {
        console.log("WHOA! You're going to LOVE this lineup! ", addThePlayerLineup);
        bestLineup = Object.assign({}, addThePlayerLineup);
      }
      stillValid = false;
    } else {
      var remZScore = simplexer(currPlayerList, nextCap, nextRemainingPlayers);
      // console.log('remZScore: ', remZScore);
      if (! remZScore) {
        // console.log('in here');
        stillValid = false;
      } else {
        var nextBest = addThePlayerLineup.totalZScore + remZScore;
        if (nextBest < bestLineup.totalZScore) {
          stillValid = false;
        }
      }
    }
    if (stillValid) {
      branchAndBound(copiedPlayerList, addThePlayerLineup, nextCap, nextRemainingPlayers);
    }

    branchAndBound(currPlayerList, currLineup, currCap, remainingPlayers);

  }
}
