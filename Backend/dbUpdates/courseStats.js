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

// getScoreCardsFromDB(tourn_id);
// getScoreCardsFromPGA(tourn_id);

function getScoreCardsFromDB (tourn_id) {
  return Tournament_Results.findAll({where: {tourn_id}})
  .then(res => {
    return res.map(player => {
      let x = {
        player_name: player.player_name,
        pga_id: player.pga_id,
        dkScore: 0,
        tourn_id,
        strokes: 0,
        rounds: 0
      }, allRoundsUnder70Strokes = true;
      JSON.parse(player.score_cards).p.rnds.forEach(round => {
        let previousHoleScore = 0, birdieStreak = true, bogeyFreeRound = true, birdieCount = 0, strokes = 0;
        x.rounds ++;
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
        x.strokes += strokes;
      });
      if (allRoundsUnder70Strokes) x.dkScore += 5;
      return x;
    });
  })
  .then(rankAndScoreFinishing)
  .then(res => {
    return Promise.map(res, player => {
      return Tournament_Results.find({where: {pga_id: player.pga_id, tourn_id}})
      .then(res => res.update({dk_points: player.dkScore}))
    });
  })
  .then(res => console.log("Success :)"))
  .catch(err => console.error(err));
}
function rankAndScoreFinishing (res) {
  res.sort((a, b) => {
    if (a.rounds < b.rounds) {
      return 1;
    } else if (a.rounds == b.rounds) {
      return a.strokes - b.strokes;
    } return -1;
  });
  res.forEach((player, idx) => {
    if (res[idx-1] && res[idx-1].strokes === player.strokes) player.pos = res[idx-1].pos
    else player.pos = idx + 1;
    if (player.pos <= 50) finishPoints(player);
  });
  return res;
}
function finishPoints (player) {
  if (player.pos === 1) player.dkScore += 30;
  else if (player.pos === 2) player.dkScore += 20;
  else if (player.pos === 3) player.dkScore += 18;
  else if (player.pos === 4) player.dkScore += 16;
  else if (player.pos === 5) player.dkScore += 14;
  else if (player.pos === 6) player.dkScore += 12;
  else if (player.pos === 7) player.dkScore += 10;
  else if (player.pos === 8) player.dkScore += 9;
  else if (player.pos === 9) player.dkScore += 8;
  else if (player.pos === 10) player.dkScore += 7;
  else if (player.pos <= 15) player.dkScore += 6;
  else if (player.pos <= 20) player.dkScore += 5;
  else if (player.pos <= 25) player.dkScore += 4;
  else if (player.pos <= 30) player.dkScore += 3;
  else if (player.pos <= 40) player.dkScore += 2;
  else if (player.pos <= 50) player.dkScore += 1;
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
