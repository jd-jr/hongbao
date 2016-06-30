import {connect} from 'react-redux';
import Home from '../components/home';

function mapStateToProps(state, ownProps) {
  const {query} = ownProps.location;
  const {detail} = query || {};
  return {detail};
}

export default connect(mapStateToProps)(Home);
