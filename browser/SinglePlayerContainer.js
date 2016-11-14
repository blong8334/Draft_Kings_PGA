import { connect } from 'react-redux';
import { updateTotalSalary, updateField, setCurrentPlayer, addToLineup } from './action-creators';
import SinglePlayerComponent from './SinglePlayerComponent';

const mapStateToProps = function (state) {
  return {
    player: state.player.player,
    fieldIndex: state.player.fieldIndex,
    lineup: state.lineup,
    field: state.field
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    setCurrentPlayer:  (player) => {
      dispatch(setCurrentPlayer(player))
    },
    addToLineup: (player) => {
      dispatch(addToLineup(player))
    },
    updateField: (field) => {
      dispatch(updateField(field))
    },
    updateSalary: (salary) => {
      dispatch(updateTotalSalary(salary));
    }
  };
};

const componentCreator = connect(mapStateToProps, mapDispatchToProps);
const SinglePlayerContainer = componentCreator(SinglePlayerComponent);
export default SinglePlayerContainer;
