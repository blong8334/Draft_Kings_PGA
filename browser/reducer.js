import { combineReducers } from 'redux';
import { UPDATE_ANALYZED_STATS, ADD_TO_LINEUP, UPDATE_FIELD, SET_CURRENT_PLAYER } from './action-creators';

// *^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*
function statReducer (state = {}, action) {
    switch (action.type) {
      case UPDATE_ANALYZED_STATS:
      return action.stats
      default:
      return state;
    }
}
// *^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*
var initialLineup = {
  remainingSalary: 50000,
  remainingPlayers: 6,
  players: []
};
function lineupReducer (state = initialLineup, action) {
  switch (action.type) {
    case ADD_TO_LINEUP:
      state.remainingSalary -= +action.player.dk_salary;
      -- state.remainingPlayers;
      state.players.push(action.player);
      return Object.assign({}, state);
    default:
      return state;
  }
}
// *^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*
function fieldReducer (state = [], action) {
  switch (action.type) {
    case UPDATE_FIELD:
    return action.field;
    default:
    return state;
  }
}
// *^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*
function playerReducer (state = {}, action) {
  switch (action.type) {
    case SET_CURRENT_PLAYER:
    return {
      player: action.player,
      fieldIndex: action.fieldIndex
    };
    default:
    return state;
  }
}
// *^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*
const rootReducer = combineReducers({
  field: fieldReducer,
  player: playerReducer,
  lineup: lineupReducer,
  stats: statReducer
});

export default rootReducer;
