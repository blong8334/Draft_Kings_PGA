'use strict';

const express = require('express');
const volleyball = require('volleyball');

const app = express();

app.use(volleyball);

app.use(express.static(__dirname));

app.get('/api/puppies', function (req, res) {
  res.json(puppies.map(({id, name}) => ({id, name})));
});

app.get('/api/puppies/:id', function (req, res) {
  const aPuppy = puppies.find(p => p.id === Number(req.params.id));
  if (!aPuppy) res.status(404).end();
  else res.json(aPuppy);
});

app.listen(3000, function () {
  console.log('Server listening on port', 3000);
});
