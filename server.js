'use strict';

const express = require('express');
const bodyParser = require('body-parser')
const volleyball = require('volleyball');
const { get_all_stats_for_current_field } = require('./Backend/statManipulator/contest_player_list_with_all_stats');
const { reduce_all_stats_to_one, stats_for_last_x_weeks_with_analysis } = require('./Backend/statManipulator/stat_lumper');

const app = express();

app.use(volleyball);

app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '5mb'}))

app.get('/currentField', function (req, res) {
  get_all_stats_for_current_field()
    .then(players => {
      res.json(players);
    })
    .catch(err => console.error(err));
});

app.post('/combineStats', (req, res, next) => {
  var stats = req.body.stats;
  // console.log(stats);

  reduce_all_stats_to_one(stats);
  res.end();
  // boil down all stats to one

  // then convert the stats into a format where
      // the simplexer can work with them.

  // then send the results to the branch and bound.

});

app.post('/reduceStats', (req, res, next) => {
  var field = req.body.field;
  var weeks = req.body.weeks;
  // need to reduce the received stats into the weeks we receive.
  var x = stats_for_last_x_weeks_with_analysis(field, weeks);

  res.json(x);

});
app.get('/:anything', (req, res, next) => {
  console.log('Nothing to see here');
  res.end();
});


app.listen(3000, function () {
  console.log('Everyone is happy!');
  console.log('Server listening on port', 3000);
});
