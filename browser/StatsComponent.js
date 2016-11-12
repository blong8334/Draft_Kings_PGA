import React from 'react';
import { Link, browserHistory } from 'react-router'

export default class StatsComponent extends React.Component {
  constructor () {
    super();
    this.state = {};
    // this.setPlayer = this.setPlayer.bind(this);
  }

  render () {
    return (
      <div >
        <Link to="/players">
        <button className="btn btn-primary btn-lg" >Go back to players</button>
        </Link>
        <div className="form-check">
          {
            Object.keys(this.props.stats) && Object.keys(this.props.stats).map((stat, index) => {
              var totalPlayers = this.props.field.length;
              var statGuy = this.props.stats[stat];
              return (
                <div key={index}>
                  <label className="form-check-label">
                    <input className="form-check-input" type="checkbox" value="1" />
                    <div>
                      <ul>
                        <li>Stat Name: {statGuy.stat_name}</li>
                        <li>Player total: {statGuy.total_in_field}</li>
                        <li>Pct of field: {statGuy.total_in_field/totalPlayers}</li>
                      </ul>
                    </div>
                  </label>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}

// From here the link will change the state of the current player to whichever player is clicked
// display the new page with the players tournament info and their stats.
