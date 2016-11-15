import axios from 'axios';
//******************************************************************************
export const RESET_SALARY = 'RESET_SALARY';
export const resetSalary = () => {
  return {
    type: RESET_SALARY
  }
}
//******************************************************************************
export const UPDATE_TOTAL_SALARY = 'UPDATE_TOTAL_SALARY';
export const updateTotalSalary = (salary) => {
  return {
    type: UPDATE_TOTAL_SALARY,
    salary
  }
}
//******************************************************************************
export const BEST_LINEUP = 'BEST_LINEUP';
export const loadTheBest = (lineup) => {
  return {
    type: BEST_LINEUP,
    lineup
  }
}
export const getTheBest = (arr, players, salaryCap, field) => {
  return dispatch => {
    axios.post('/combineStats', {stats: arr})
    .then(res => {

      // NOTE: now res has combined stats into one value
      // for the simplexer to work with.  we need to make sure these stats
      // are in a format the simplexer can work with.
      // console.log('res ', res.data);
      // console.log('typeof res: ', typeof res.data);
      // now we call get z scores.
      return axios.post('/getZscores', {stats: res.data, field})
    })
    .then(res => {
      // then once we get the zscores, we send it to the branch and bound and let him do the rest.
      var zscoreArr = res.data;
      // NOW SEND TO THE BRANCH AND BOUND!!!!!!!
      return axios.post('/branchAndBound', {
        zscoreArr, players, salaryCap
      });
    })
    .then(res => {
      dispatch(updateTotalSalary(+res.data.totalSal));
      dispatch(loadTheBest(res.data));
    })
    .catch(err => console.error(err));
  }

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
export const REMOVE_FROM_LINEUP = 'REMOVE_FROM_LINEUP';
export const removeFromLineup = (player) => {
  return {
    type: REMOVE_FROM_LINEUP,
    player
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
