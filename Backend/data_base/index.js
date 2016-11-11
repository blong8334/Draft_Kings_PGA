const db = require('./_db');
const Player_Table = require('./models/player-model');
const DK_Table = require('./models/dk-lineup-model');
const Curr_Tourn = require('./models/curr-tourn-model');
const Players_Seasons_Stats = require('./models/seasons-stats');
const Weekly_Field_Stats = require('./models/weekly_stats');
const Players_Stats_Per_Tournament = require('./models/player_stats_per_tournament');

DK_Table.belongsTo(Curr_Tourn);

module.exports = {
  db,
  Player_Table,
  DK_Table, Curr_Tourn,
  Players_Seasons_Stats,
  Weekly_Field_Stats,
  Players_Stats_Per_Tournament
 };
