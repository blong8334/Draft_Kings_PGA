const { Course_Info, db } = require('../data_base/index');
const req_prom = require('request-promise');
// in the db lets have a course stats

// => course stats.
// => player scorecards.
// => leaderboard.


let tourn_id = '004';

getCourseStatsFromDB(tourn_id)
.then(res => {
  res.forEach(course => {
    console.log(course);
  });
});

function getCourseStatsFromDB (tourn_id) {
  return Course_Info.find({where: {tourn_id}})
  .then(res => JSON.parse(res.info).courses)
  .catch(err => console.error(err));
}

// getCourseStatsFromPga(tourn_id);

function getCourseStatsFromPga (tourn_id) {
  let url = `http://www.pgatour.com/data/r/${tourn_id}/coursestat.json`;
  return req_prom(url)
  .then(res => {
    return Course_Info.create({
      tourn_id,
      info: res
    });
  })
  .then(res => console.log("Success :) "))
  .catch(err => console.error(err));
}
function getScoreCards (tourn_id) {
  let url = `/data/r/{tourn_id}/scorecards/{player_pga_id}.json`;

  // First get a list of all the players in this week's tourn.
  // for each player get their scorecards and save in the player results table.

}
function getLeaderBoard (tourn_id) {
  let url = `/data/r/{tourn_id}/{year}/leaderboard-v2.json`;
}
