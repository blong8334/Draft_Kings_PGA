'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import AllPuppies from './AllPuppies';

ReactDOM.render(
  <div className="container flexbox-container">
    <div className="jumbotron">
      <AllPuppies />
    </div>
  </div>,
  document.getElementById('app')
);