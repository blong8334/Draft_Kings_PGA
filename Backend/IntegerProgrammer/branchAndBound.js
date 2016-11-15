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
      // If there are not enough players left to make a valid lineup, we are done.
      return;
    }

    // This is the lineup where we will add the player.
    var addThePlayerLineup = Object.assign({}, currLineup);
    // Get the next player
    var nextPlayer = currPlayerList.shift();

    // Copy the current lineup to the new lineup.
    addThePlayerLineup.lineup = currLineup.lineup.slice();
    // Add the player to the new lineup.
    addThePlayerLineup.lineup.push(nextPlayer);
    // Update total lineup salary
    addThePlayerLineup.totalSal += +nextPlayer.salary;
    // Update total lineup value
    addThePlayerLineup.totalZScore += +nextPlayer.zscore;

    var copiedPlayerList = currPlayerList.slice();
    // Update the new salary cap for the added player lineup.
    var nextCap = currCap - nextPlayer.salary;
    // Update the remaining players needed to fill our lineup.
    var nextRemainingPlayers = remainingPlayers - 1;

    // Check if the new lineup is still valid.
    var stillValid = true;

    // Have we exceeded the salary cap?
    if (nextCap < 0) {
      // The linuep is no longer valid.
      stillValid = false;
    } else if (nextRemainingPlayers === 0) {
      // We have a valid lineup.
      // Check if it is better than the current best solution.
      if (addThePlayerLineup.totalZScore > bestLineup.totalZScore) {
        // This lineup is better than the current best.
        console.log("WHOA! You're going to LOVE this lineup! ", addThePlayerLineup);
        // Update the best lineup.
        bestLineup = Object.assign({}, addThePlayerLineup);
      }
      // Otherwise we are done with this lineup since it is not better than the best.
      stillValid = false;
    } else {
      // Check if the 'relaxed' solution to the current problem + the current value is better than the best.
      var remZScore = simplexer(currPlayerList, nextCap, nextRemainingPlayers);
      if (! remZScore) {
        // If the problem is unfeasible, we are done with it.
        stillValid = false;
      } else {
        // The value of the current lineup's score + the relaxed solution's score.
        var nextBest = addThePlayerLineup.totalZScore + remZScore;
        if (nextBest < bestLineup.totalZScore) {
          // nextBest is not better than the current best, there is no point in checking this branch
          // any further.
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
