import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Initiate from '../components/home/Initiate';

function mapStateToProps(state, ownProps) {
  const {query} = ownProps.location;
  const {identifier, title, skuName, status} = query;

  return {
    identifier,
    title,
    skuName,
    status
  };
}


export default connect(mapStateToProps)(Initiate);

