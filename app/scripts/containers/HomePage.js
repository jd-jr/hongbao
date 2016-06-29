import {connect} from 'react-redux';
import Home from '../components/home';

function mapStateToProps(state, ownProps) {
  const {query} = ownProps.location;
  const {thirdAccId} = ownProps.params;
  return {thirdAccId, ...query};
}

export default connect(mapStateToProps)(Home);
