import {connect} from 'react-redux';
import Home from '../components/home';

function mapStateToProps(state, ownProps) {
  const {query, pathname} = ownProps.location;
  const {detail, identifier, title, skuName, status, skuIcon, mystic} = query || {};
  return {detail, identifier, title, skuName, status, skuIcon, mystic, pathname};
}

export default connect(mapStateToProps)(Home);
