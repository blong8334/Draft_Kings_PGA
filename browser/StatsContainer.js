import { connect } from 'react-redux';
import { getTheBest } from './action-creators';
import StatsComponent from './StatsComponent';

const mapStateToProps = function (state) {
  return {
    lineup: state.lineup,
    field: state.field,
    stats: state.stats
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    getTopLineup: (arr) => {
      getTheBest(arr);
    }
  };
};

const componentCreator = connect(mapStateToProps, mapDispatchToProps);
const StatsContainer = componentCreator(StatsComponent);
export default StatsContainer;
