const { DK_Table, Players_Stats_Per_Tournament } = require('/Users/brianlong/Fullstack/Draft_Kings/Backend/data_base/index.js');
const Promise = require('bluebird');

// %^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^
function get_all_stats_for_current_field (tourn_id) {
  return getNameSalaryPGA_id(tourn_id)
  .then(res => getPlayerStats(res))
  .catch(err => console.error(err));
}
function getPlayerStats (arr) {
  return Promise.map(arr, player =>
    Promise.props({
      pga_id: player.pga_id,
      dk_salary: player.dk_salary,
      player_name: player.name,
      stats: Players_Stats_Per_Tournament.findAll({where: {player_id: player.pga_id}})
      .then(res => (res.length && res.map(({dataValues: {tournament_id, stats, tourn_begin_date}}) =>
      ({tournament_id, stats, tourn_begin_date}))) || [])
    })
  );
}
function getNameSalaryPGA_id (tourn_id) {
  return DK_Table.findAll({where: {tourn_id, pga_id: {$ne: null}}})
  .then(res => res.length && res.map(({dataValues: {pga_id, dk_salary, name}}) => ({pga_id, dk_salary, name})));
}
// %^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^

// %^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^
function get_stats_for_last_x_weeks (arr, lastX) {
  return arr.map(player => {
    player.stats.sort((a, b) => new Date(b.tourn_begin_date) - new Date(a.tourn_begin_date));
    player.stats = player.stats.slice(0, lastX);
    return player;
  });
}
// %^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^

module.exports = { get_stats_for_last_x_weeks, get_all_stats_for_current_field };
