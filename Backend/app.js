var express = require('express');
var fs      = require('fs');
var request = require('request');
var rp      = require('request-promise');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
const app     = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/stat_cat/:pga_id', (req, res, next) => {
  var url = 'http://www.pgatour.com/data/players/'+req.params.pga_id+'/2016stat.json';
  request(url, (err, resp, body) => {
    res.json(body);
  });
});
app.get('/player_list', (req, res, next) => {
  var url = 'http://www.pgatour.com/players.html';
  request(url, (err, resp, body) => {
    var $ = cheerio.load(body);
    var mookie = $('span.name a');
    var retObj = {};
    for (var key in mookie) {
      if (mookie[key].attribs) {
        retObj[key] = {
          href: mookie[key].attribs.href
        };
      }
    }
    res.json(retObj);
  });
});

module.exports = app;
