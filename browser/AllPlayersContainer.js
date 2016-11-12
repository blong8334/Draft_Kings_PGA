import { connect } from 'react-redux';
import { reduceFieldStats, addToLineup, loadPlayers, setCurrentPlayer } from './action-creators';
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
    }
  };
};

const componentCreator = connect(mapStateToProps, mapDispatchToProps);
const AllPlayersContainer = componentCreator(AllPlayersComponent);
export default AllPlayersContainer;
