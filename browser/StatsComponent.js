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
        <button className="btn btn-secondary btn-lg" >Go back to players</button>
        </Link>
        <button className="btn btn-primary btn-lg" >Let's Optimize!!!</button>
        <div>
          <h4>Remaining Players: {this.props.lineup.remainingPlayers}</h4>
          <h4>Remaining Salary: {this.props.lineup.remainingSalary}</h4>
          <h4>Current lineup: </h4>
          {
            this.props.lineup.players.length && this.props.lineup.players.map((player, index) => {
              return (
                <div key={index}>
                  <p>${player.dk_salary}, {player.player_name}</p>
                </div>
              )
            })
          }
        </div>
        <div className="form-check">
          {
            Object.keys(this.props.stats) && Object.keys(this.props.stats).map((stat, index) => {
              var totalPlayers = this.props.field.length;
              var statGuy = this.props.stats[stat];
              return (
                <div key={index}>
                  <label className="form-check-label">
                    <input onChange={() => {
                      if (this.state[stat]) {
                        delete this.state[stat];
                      } else {
                        this.state[stat] = 'Yeah';
                      }
                      console.log(this.state);
                    }} className="form-check-input" type="checkbox" />
                    <div>
                      <ul>
                        <li>Stat Name ({index + 1}): {statGuy.stat_name}</li>
                        <li>Total players with this stat: {statGuy.total_in_field}</li>
                        <li>Pct of field: {Math.round(10000 * (statGuy.total_in_field / totalPlayers))/100}%</li>
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
