import { connect } from 'react-redux';
import { loadTheBest, resetSalary } from './action-creators';
import BestLineupComponent from './BestLineupComponent';

const mapStateToProps = function (state) {
  return {
    bestLineup: state.bestLineup,
    lineup: state.lineup,
    salary: state.salary
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    resetSalary: () => {
      dispatch(resetSalary());
    },
    loadTheBest: (arr) => {
      dispatch(loadTheBest(arr));
    }
  };
};

const componentCreator = connect(mapStateToProps, mapDispatchToProps);
const BestLineupContainer = componentCreator(BestLineupComponent);
export default BestLineupContainer;
