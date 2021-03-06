const { getPlayerZscores } = require('./playerStatsAndScores');
const { simplexer } = require('./tableauMaker');
let line_queue = [];
let line_count;

let lineups_len = 20;

function getBestLineup (players, cap, totalPlayerCount) {
  bestLineup = findFirstBest(players, cap, totalPlayerCount);
  line_queue = [];
  line_queue.push(Object.assign({}, bestLineup));

  line_count = 1;

  let count = 0;
  let currLineup = {
    totalSal: 0,
    totalZScore: 0,
    lineup: []
  };
  let start = new Date();
  branchAndBound(players, currLineup, cap, totalPlayerCount);
  let end = new Date();
  console.log("Program took: ", (end-start)/1000);
  console.log('*** LINE QUEUE ***');
  line_queue.forEach(el => console.log(el));
  return line_queue[line_queue.length - 1];

  function branchAndBound (currPlayerList, currLineup, currCap, remainingPlayers) {
    if (currPlayerList.length + currLineup.lineup.length < totalPlayerCount) {
      // If there are not enough players left to make a valid lineup, we are done.
      return;
    }

    // This is the lineup where we will add the player.
    let addThePlayerLineup = Object.assign({}, currLineup);
    // Get the next player
    let nextPlayer = currPlayerList.shift();

    // Copy the current lineup to the new lineup.
    addThePlayerLineup.lineup = currLineup.lineup.slice();
    // Add the player to the new lineup.
    addThePlayerLineup.lineup.push(nextPlayer);
    // Update total lineup salary
    addThePlayerLineup.totalSal += +nextPlayer.salary;
    // Update total lineup value
    addThePlayerLineup.totalZScore += +nextPlayer.zscore;

    let copiedPlayerList = currPlayerList.slice();
    // Update the new salary cap for the added player lineup.
    let nextCap = currCap - nextPlayer.salary;
    // Update the remaining players needed to fill our lineup.
    let nextRemainingPlayers = remainingPlayers - 1;

    // Check if the new lineup is still valid.
    let stillValid = true;

    // Have we exceeded the salary cap?
    if (nextCap < 0) {
      // The linuep is no longer valid.
      stillValid = false;
      // Do we have six players?
    } else if (nextRemainingPlayers === 0) {
      // We have a valid lineup.
      // Check if it is better than the current best solution.
      if (addThePlayerLineup.totalZScore > line_queue[0].totalZScore) {
        // This lineup is better than the current best.
        // console.log("WHOA! You're going to LOVE this lineup! ", addThePlayerLineup);
        console.log(line_count ++ + ': We found a sweet lineup for you');
        // Update the best lineup.
        // bestLineup = Object.assign({}, addThePlayerLineup);
        line_queue.push(Object.assign({}, addThePlayerLineup));
        if (line_queue.length > lineups_len) {
          line_queue.shift();
        }
        line_queue.sort((a, b) => {
          return a.totalZScore - b.totalZScore;
        });
        // Need to sort the queue now.
      }
      // Otherwise we are done with this lineup since it is not better than the best.
      stillValid = false;
    } else {
      // Check if the 'relaxed' solution to the current problem + the current value is better than the best.
      let remZScore = simplexer(currPlayerList, nextCap, nextRemainingPlayers);
      if (! remZScore) {
        // If the problem is unfeasible, we are done with it.
        stillValid = false;
      } else {
        // The value of the current lineup's score + the relaxed solution's score.
        let nextBest = addThePlayerLineup.totalZScore + remZScore;
        if (nextBest < line_queue[0].totalZScore) {
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
  let bestLineup = {
    totalSal: 0,
    totalZScore: 0,
    lineup: []
  };
  for (let i = 0; i < players.length; i++) {
    // console.log('best lineup ', bestLineup);

    if (bestLineup.lineup.length < totalPlayerCount) {
      bestLineup.lineup.push(players[i]);

      bestLineup.totalSal += players[i].salary;
      bestLineup.totalZScore += players[i].zscore;
    }
    if (bestLineup.lineup.length === totalPlayerCount && bestLineup.totalSal > cap) {
      let leavingPlayer = bestLineup.lineup.shift();
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
