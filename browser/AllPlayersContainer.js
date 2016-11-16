import { connect } from 'react-redux';
import {
  sortFieldByName,
  sortFieldBySalary,
  updateField,
  removeFromLineup,
  updateTotalSalary,
  reduceFieldStats,
  addToLineup,
  loadPlayers,
  setCurrentPlayer
} from './action-creators';

import AllPlayersComponent from './AllPlayersComponent';

const mapStateToProps = function (state) {
  return {
    field: state.field,
    lineup: state.lineup
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    setCurrentPlayer:  (player, fieldIndex) => {
      dispatch(setCurrentPlayer(player, fieldIndex));
    },
    reduceStats: (field, weeks) => {
      dispatch(reduceFieldStats(field, weeks));
    },
    removeAndUpdateField: (player, field) => {
      dispatch(removeFromLineup(player));
      field.unshift(player);
      dispatch(updateField(field));
    },
    sortFieldBySal: (field) => {
      dispatch(sortFieldBySalary(field));
    },
    sortFieldByName: (field) => {
      dispatch(sortFieldByName(field));
    }
    //REMOVE PLAYER FROM LINEUP AND ADD BACK TO FIELD.
  };
};

const componentCreator = connect(mapStateToProps, mapDispatchToProps);
const AllPlayersContainer = componentCreator(AllPlayersComponent);
export default AllPlayersContainer;
