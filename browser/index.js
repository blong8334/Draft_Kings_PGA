'use strict';

import React from 'react'
import { Router, Route, IndexRedirect, browserHistory, IndexRoute } from 'react-router'
import { render } from 'react-dom'
import { connect, Provider } from 'react-redux'
import store from './store'

import AllPlayersContainer from './AllPlayersContainer';
import SinglePlayerContainer from './SinglePlayerContainer';
import StatsContainer from './StatsContainer';

import { loadPlayersFromServer } from './action-creators';

const onPlayersEnter = function () {
  const thunk = loadPlayersFromServer();
  store.dispatch(thunk);
}

render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" onEnter={onPlayersEnter}>
      <IndexRedirect to="/players" />
      <Route path="players" component={AllPlayersContainer} />
      <Route path="currentPlayer" component={SinglePlayerContainer} />
      <Route path="stats" component={StatsContainer} />
    </Route>
  </Router>
</Provider>,
document.getElementById('app')
);
