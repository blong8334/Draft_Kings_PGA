import React from 'react';
import { Link, browserHistory } from 'react-router'

export default class BestLineupComponent extends React.Component {
  constructor () {
    super();
    this.state = {
    };
  }
  reset () {
    this.props.resetSalary();
    this.props.loadTheBest([]);
  }

  render () {
    return (
      <div className="list-group">
        <Link to="/">
        <button onClick={() => this.reset()} className="btn btn-primary btn-lg">Start Over</button>
      </Link>
      <Link to="/stats">
      <button onClick={() => this.reset()} className="btn btn-primary btn-lg">Go Back To Stats</button>
    </Link>
    <div>
      <h3>Total Salary: {this.props.salary}</h3>
      <h3>Your Lineup: </h3>
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
    <div>
      <h3>These guys are the best:</h3>
      {
        this.props.bestLineup.lineup && this.props.bestLineup.lineup.map((player, index) => {
          var classes = 'list-group-item'
          return (
            <div key={index}>
              <p>${player.salary}, {player.player_name}</p>
            </div>
          )
        })
      }
    </div>
  </div>
)
}
}
