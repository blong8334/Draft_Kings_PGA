'use strict';

const express = require('express');
const bodyParser = require('body-parser')
const volleyball = require('volleyball');
const path = require('path');
const { get_all_stats_for_current_field } = require('./Backend/statManipulator/contest_player_list_with_all_stats');
const { reduce_all_stats_to_one, stats_for_last_x_weeks_with_analysis } = require('./Backend/statManipulator/stat_lumper');
const { getPlayerZscores } = require('./Backend/IntegerProgrammer/playerStatsAndScores');
const { getBestLineup } = require('./Backend/IntegerProgrammer/branchAndBound');

const app = express();

app.use(volleyball);

app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '5mb'}));

app.post('/branchAndBound', (req, res, next) => {
  var zscoreArr = req.body.zscoreArr;
  var players = req.body.players;
  var salaryCap = req.body.salaryCap;

  var best = getBestLineup(zscoreArr, salaryCap, players);
  res.json(best);
});
app.post('/getZscores', (req, res, next) => {
  var stats = req.body.stats;
  var field = req.body.field;
  var zscores = getPlayerZscores(stats, field);
  res.json(zscores);
});

app.get('/currentField', function (req, res) {
  get_all_stats_for_current_field()
    .then(players => {
      res.json(players);
    })
    .catch(err => console.error(err));
});

app.post('/combineStats', (req, res, next) => {
  var stats = req.body.stats;
  // boil down all stats to one
  var newStats = reduce_all_stats_to_one(stats);

  res.json(newStats);

});


app.post('/reduceStats', (req, res, next) => {
  var field = req.body.field;
  var weeks = req.body.weeks;
  // need to reduce the received stats into the weeks we receive.
  var x = stats_for_last_x_weeks_with_analysis(field, weeks);

  res.json(x);

});
app.get('/*', function (request, response){
  response.sendFile(path.resolve('./index.html'));
})


app.listen(3000, function () {
  console.log('Everyone is happy!');
  console.log('Server listening on port', 3000);
});
