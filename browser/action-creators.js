import axios from 'axios';


//******************************************************************************
export const getTheBest = (arr) => {
  axios.post('/combineStats', {stats: arr})
    .then(res => console.log(res))
    .catch(err => console.error('something is wrong'));

}
// ******************************************************************************
export const UPDATE_ANALYZED_STATS = 'UPDATE_ANALYZED_STATS';

export const updateAnalyzedStats = (stats) => {
  return {
    type: UPDATE_ANALYZED_STATS,
    stats
  }
}

export const reduceFieldStats = (field, weeks) => {
  return dispatch => {
    var stuff = {field, weeks};
    axios.post('/reduceStats', stuff)
    .then(res => {
      dispatch(updateAnalyzedStats(res.data));
    })
    .catch(err => console.error('Something bad happened.'));
  }
}
//******************************************************************************
export const ADD_TO_LINEUP = 'ADD_TO_LINEUP';

export const addToLineup = (player) => {
  return {
    type: ADD_TO_LINEUP,
    player
  }
}
//******************************************************************************
export const UPDATE_FIELD = 'UPDATE_FIELD';

export const updateField = (players) => {
  return {
    type: UPDATE_FIELD,
    field: players
  }
}

export const loadPlayersFromServer = () => {
  return (dispatch) => {
    axios.get('/currentField')
    .then(res => {
      dispatch(updateField(res.data));
    })
    .catch(err => console.error(err));
  }
}
//******************************************************************************
export const SET_CURRENT_PLAYER = 'SET_CURRENT_PLAYER';

export const setCurrentPlayer = (player, fieldIndex) => {
  return {
    type: SET_CURRENT_PLAYER,
    player,
    fieldIndex
  }
}
