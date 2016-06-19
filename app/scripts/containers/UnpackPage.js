import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Index from '../components/unpack';

function mapStateToProps(state, ownProps) {
  const {id} = ownProps.params;
  return {
    id
  };
}


export default connect(mapStateToProps)(Index);

