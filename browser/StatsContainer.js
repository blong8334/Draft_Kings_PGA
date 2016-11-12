import { connect } from 'react-redux';
import {  } from './action-creators';
import StatsComponent from './StatsComponent';

const mapStateToProps = function (state) {
  return {
    lineup: state.lineup,
    field: state.field,
    stats: state.stats
  };
};

const mapDispatchToProps = function (dispatch) {
  return {};
};

const componentCreator = connect(mapStateToProps, mapDispatchToProps);
const StatsContainer = componentCreator(StatsComponent);
export default StatsContainer;
