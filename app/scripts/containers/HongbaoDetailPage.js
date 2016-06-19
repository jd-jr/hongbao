import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import HongbaoDetail from '../components/hongbao/HongbaoDetail';

function mapStateToProps(state, ownProps) {
  const {id} = ownProps.params;
  return {
    id
  };
}

export default connect(mapStateToProps)(HongbaoDetail);

