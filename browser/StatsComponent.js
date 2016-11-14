import React from 'react';
import { Link, browserHistory } from 'react-router'

export default class StatsComponent extends React.Component {
  constructor () {
    super();
    this.state = {};
    this.getTheBestLineup = this.getTheBestLineup.bind(this);
  }

  getTheBestLineup () {

    if (Object.keys(this.state).length) {
      // reduce the stats for the keys to one workable format for the
      // z score function.

      // need to set up a server post route for the reducer then the branch and bound algo.

      // NOTE: we have to use an array because the prissy z score function demands it.
      // She's a bitch.
      var chosenOnes = [];

      for (var keys in this.state) {
        // add the stats to the chosen Ones arr.
        chosenOnes.push(this.props.stats[keys]);

      }
      // console.log('chosenOnes ', chosenOnes);
      var remainingSalary = this.props.lineup.remainingSalary;
      var remainingPlayers = this.props.lineup.remainingPlayers;

      this.props.getTopLineup(chosenOnes, remainingPlayers, remainingSalary, this.props.field);
      browserHistory.push('/bestLineup')

    } else {
      alert("Pick some fucking stats!!!");
    }
  }

  render () {
    return (
      <div >
        <Link to="/players">
        <button className="btn btn-secondary btn-lg" >Go back to players</button>
      </Link>
      <button onClick={() => this.getTheBestLineup()} className="btn btn-primary btn-lg" >Let's Optimize!!!</button>
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
