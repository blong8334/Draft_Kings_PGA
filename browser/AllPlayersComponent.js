import React from 'react';
import { Link, browserHistory } from 'react-router'

export default class AllPlayersComponent extends React.Component {
  constructor () {
    super();
    this.state = {
      weeks: 1
    };
    this.setPlayer = this.setPlayer.bind(this);
    this.setWeeks = this.setWeeks.bind(this);
    this.submitChoices = this.submitChoices.bind(this);
    this.removeFromLineup = this.removeFromLineup.bind(this);
  }

  setPlayer (player, numTourns, fieldIndex) {
    this.props.setCurrentPlayer(player, fieldIndex);
    browserHistory.push('/currentPlayer');
  }
  setWeeks (e) {
    this.state.weeks = e.target.value;
  }
  submitChoices () {
    // send the field and the number of weeks to some function
    // that posts the info to some server route to send to the Backend
    // to return to us a list of stats.

    // then redirect to some page where we see all the stats
    // we are allowed to choose from for that week.
    this.props.reduceStats(this.props.field, this.state.weeks);
    browserHistory.push('/stats');
  }
  removeFromLineup (player) {
    this.props.removeAndUpdateField(player, this.props.field);
  }

  render () {
    return (
      <div className="list-group">
        <div>
          <h3>Remaining Players: {this.props.lineup.remainingPlayers}</h3>
          <h3>Remaining Salary: {this.props.lineup.remainingSalary}</h3>
          <h3>Current lineup: </h3>
          {
            this.props.lineup.players.length && this.props.lineup.players.map((player, index) => {
              return (
                <div key={index}>
                  <button onClick={() => this.removeFromLineup(player)} className="list-group-item">
                    <p>${player.dk_salary}, {player.player_name}</p>
                  </button>
                </div>
              )
            })
          }
        </div>
        <div>
          <h4>How Many Previous Tournaments Should We Consider For Each Player?</h4>
          <select onChange={this.setWeeks} className="form-control">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </select>
        </div>
        <div>
          <button onClick={this.submitChoices} type="button" className="btn btn-primary btn-lg" >Submit!!</button>
          <div></div>
          <button onClick={() => {
            this.props.sortFieldBySal(this.props.field);
            this.forceUpdate();
          }
        } type="button" className="btn btn-secondary btn-md" >Sort Players by Salary</button>
        <button onClick={() => {
          this.props.sortFieldByName(this.props.field);
          this.forceUpdate();
        }
      } type="button" className="btn btn-secondary btn-md" >Sort Players by Name</button>
    </div>
    <div>
      <p> </p>
    </div>
    <div>
      {
        this.props.field.length && this.props.field.map((player, index) => {
          let numTourns = player.stats.length;
          let classes = 'list-group-item'
          return (
            <div key={index}>
              <button onClick={() => {this.setPlayer(player, numTourns, index)}} className={classes}>
                <span className="badge">{numTourns}</span>
                ${player.dk_salary}, {player.player_name}
              </button>
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
