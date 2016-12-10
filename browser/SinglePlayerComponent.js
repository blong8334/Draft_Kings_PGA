import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router'

export default class SinglePlayer extends Component {
  constructor () {
    super();
    this.state = {};
    this.backHome = this.backHome.bind(this);
    this.addPlayerToLineup = this.addPlayerToLineup.bind(this);
  }

  componentDidMount () {
    window.scrollTo(0, 0);
  }

  backHome () {
    this.props.setCurrentPlayer({});
    browserHistory.push('/players');
  }

  addPlayerToLineup (player) {
    let currLineup = this.props.lineup;

    let remPlayer = currLineup.remainingPlayers > 0;
    let remSal = currLineup.remainingSalary - +player.dk_salary > 0;

    if (remPlayer && remSal) {
      this.props.updateSalary(+player.dk_salary);
      this.props.addToLineup(player);
      let frontField = this.props.field.slice(0, this.props.fieldIndex);
      let backField = this.props.field.slice(this.props.fieldIndex + 1);
      let newField = frontField.concat(backField);
      this.props.updateField(newField);
      browserHistory.push('/players');
    }
  }

  render () {
    return (
      <div>
        <h2>${this.props.player.dk_salary}, {this.props.player.player_name}</h2>
        <div>
          <img src="http://placehold.it/400x400" />
        </div>
        <button className="btn btn-default" type ="button" onClick={() => this.backHome()}>Go Back</button>
        <button className="btn btn-default" type ="button" onClick={() => this.addPlayerToLineup(this.props.player)}>
          Add to lineup
        </button>
        <div>
          {
            this.props.player && this.props.player.stats.map((tourn, index) => {
              // console.log(tourn);
              return (
                <div key={index}>
                  <h4>Tournament: {tourn.tournament_id}</h4>
                  <h4>Date: {tourn.date}</h4>
                  {
                    tourn.stats.map((stat, index) => {
                      // console.log(stat);
                      return (
                        <div key={index+'h'}>
                          <p>Stat name: {stat.name}</p>
                          <p>Rank: {stat.rank}</p>
                          <p>tValue: {stat.tValue}</p>
                        </div>
                      )
                    })
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}
