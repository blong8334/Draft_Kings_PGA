const { Weekly_Field_Stats, Players_Stats_Per_Tournament } = require('../server/index');


// 457 is curr tourn id

showStats(457);

function showStats (tournament_id) {

  let obj = pullFromTable(tournament_id);

  obj.then(res => {
    let allStats = JSON.parse(res);
    let players = allStats.tournament.players;
    let tournament_id = allStats.tournament.tournamentNumber;

    players.forEach(player => {
      Players_Stats_Per_Tournament.create({
        tournament_id,
        player_id: player.pid,
        player_name: player.pn,
        stats:  player.stats
      })
      .then(res => console.log(`Success with ${res.dataValues.player_name}`))
      .catch(err => console.error('Something broke'));
    })

  })
  .catch(err => console.error('something broke'));
}


function pullFromTable (tournament_id) {
  return Weekly_Field_Stats.findOne({
    where: {
      tournament_id
    }
  })
  .then(res => {
    return res.dataValues.stats;
  })
  .catch(err => console.error('something broke in db query'));
}
