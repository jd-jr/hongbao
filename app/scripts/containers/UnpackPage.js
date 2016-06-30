import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Unpack from '../components/hongbao/Unpack';


function mapStateToProps(state, ownProps) {
  const {identifier} = ownProps.params;

  return {
    identifier
  };
}


export default connect(mapStateToProps)(Unpack);

