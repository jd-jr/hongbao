import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Unpack from '../components/hongbao/Unpack';


function mapStateToProps(state, ownProps) {
  const {id, thirdAccId} = ownProps.params;

  return {
    id,
    thirdAccId
  };
}


export default connect(mapStateToProps)(Unpack);

