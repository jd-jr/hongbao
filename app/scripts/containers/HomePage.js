import {connect} from 'react-redux';
import Home from '../components/home';
import {bindActionCreators} from 'redux';
import * as homeAction from '../actions/home';

function mapStateToProps(state, ownProps) {
  const {query, pathname} = ownProps.location;
  const {detail, identifier, title, skuName, status, skuIcon, mystic} = query || {};
  const {hongbaoInfo} = state;
  return {detail, identifier, title, skuName, status, skuIcon, mystic, pathname, hongbaoInfo};
}

function mapDispatchToProps(dispatch) {
  return {
    homeAction: bindActionCreators(homeAction, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
