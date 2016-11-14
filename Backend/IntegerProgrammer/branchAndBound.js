const { getPlayerZscores } = require('./playerStatsAndScores');
const { simplexer } = require('./tableauMaker');

function getBestLineup (players, cap, totalPlayerCount) {
  bestLineup = findFirstBest(players, cap, totalPlayerCount);
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
      if (! remZScore) {
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
function findFirstBest (players, cap, totalPlayerCount) {

  players.sort((a, b) => {
    return b.salary - a.salary;
  });
  var bestLineup = {
    totalSal: 0,
    totalZScore: 0,
    lineup: []
  };
  for (var i = 0; i < players.length; i++) {
    // console.log('best lineup ', bestLineup);

    if (bestLineup.lineup.length < totalPlayerCount) {
      bestLineup.lineup.push(players[i]);

      bestLineup.totalSal += players[i].salary;
      bestLineup.totalZScore += players[i].zscore;
    }
    if (bestLineup.lineup.length === totalPlayerCount && bestLineup.totalSal > cap) {
      var leavingPlayer = bestLineup.lineup.shift();
      bestLineup.totalSal -= leavingPlayer.salary;
      bestLineup.totalZScore -= leavingPlayer.zscore;
    } else if (bestLineup.lineup.length === totalPlayerCount && bestLineup.totalSal <= cap){
      return bestLineup;
    }
  }
}
module.exports = {
  getBestLineup
};
