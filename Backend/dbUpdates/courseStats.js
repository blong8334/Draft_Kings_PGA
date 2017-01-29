const { Course_Info, Tournament_Results, db } = require('../data_base/index');
const req_prom = require('request-promise');
const Promise = require('bluebird');
// in the db lets have a course stats

// => course stats.
// => player scorecards.
// => leaderboard.


let tourn_id = '002';

// getCourseStatsFromDB(tourn_id)
// .then(res => {
//   res.forEach(course => {
//     console.log(course);
//   });
// });
// getCourseStatsFromPga(tourn_id);

// TWINS %^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^
function getCourseStatsFromDB (tourn_id) {
  return Course_Info.find({where: {tourn_id}})
  .then(res => JSON.parse(res.info).courses)
  .catch(err => console.error(err));
}
function getCourseStatsFromPGA (tourn_id) {
  return req_prom(`http://www.pgatour.com/data/r/${tourn_id}/coursestat.json`)
  .then(res => Course_Info.create({tourn_id, info: res}))
  .then(res => console.log("Success :)"))
  .catch(err => console.error(err));
}
// %^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^

getScoreCardsFromDB(tourn_id);
// getScoreCardsFromPGA(tourn_id);

function getScoreCardsFromDB (tourn_id) {
  return Tournament_Results.findAll({where: {tourn_id}})
  .then(res => {
    // map over players => rounds => rounds => hole
    return res.map(player => {
      let x = {
        player_name: player.player_name,
        pga_id: player.pga_id,
        dkScore: 0,
        tourn_id
      }
      // console.log('Player ', x.player_name);

      let allRoundsUnder70Strokes = true;

      JSON.parse(player.score_cards).p.rnds.forEach(round => {
        let previousHoleScore = 0, birdieStreak = true, bogeyFreeRound = true, birdieCount = 0, strokes = 0;

        round.holes.forEach(({pDay, sc}) => {
          let currHoleScore = parseInt(pDay), scoreDiff = currHoleScore - previousHoleScore;
          strokes += parseInt(sc);
          if (scoreDiff <= -3) x.dkScore += 20; // Double eagle or better
          else if (scoreDiff === -2) x.dkScore += 8; // Eagle
          else if (scoreDiff === -1) x.dkScore += 3; // Birdie
          else if (scoreDiff === 0) x.dkScore += 0.5; // Par
          else if (scoreDiff === 1) x.dkScore -= 0.5; // Bogey
          else x.dkScore -= 1; // Double Bogey or worse

          if (scoreDiff >= 0) birdieCount = 0; // Not a birdie.
          if (sc === '1') x.dkScore += 10; // Hole in one.
          if (scoreDiff <= -1) birdieCount ++; // Add to birdie streak
          if (birdieCount === 3 && birdieStreak) {
            x.dkScore += 3;
            birdieStreak = false;
          }
          if (scoreDiff >= 1) bogeyFreeRound = false; // Not Bogey free round.
          previousHoleScore = currHoleScore;
        });
        if (bogeyFreeRound) x.dkScore += 3;
        if (strokes >= 70) allRoundsUnder70Strokes = false;
      });
      if (allRoundsUnder70Strokes) x.dkScore += 5;
      return x;
    });
  })
  .then(res => console.log(res))
  .catch(err => console.error(err));
}
function dkScoreCalculator (res) {

}
function getScoreCardsFromPGA (tourn_id) {
  return req_prom(`http://www.pgatour.com/data/r/${tourn_id}/field.json`)
  .then(res => {
    return Promise.map(JSON.parse(res).Tournament.Players, (player) => {
      return req_prom(`http://www.pgatour.com/data/r/${tourn_id}/scorecards/${player.TournamentPlayerId}.json`)
      .then(res => ({
        player_name: player.PlayerName,
        pga_id: player.TournamentPlayerId,
        score_cards: res,
        place: null,
        tourn_id
      }));
    });
  })
  .then(res => Tournament_Results.bulkCreate(res))
  .then(res => console.log('Success :)'))
  .catch(err => console.error(err.message));
}

// %^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^
function getLeaderBoard (tourn_id) {
  let url = `/data/r/{tourn_id}/{year}/leaderboard-v2.json`;
}
