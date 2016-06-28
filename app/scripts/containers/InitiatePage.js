import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Initiate from '../components/home/Initiate';

function mapStateToProps(state, ownProps) {
  const {query} = ownProps.location;
  const {identifier, title, skuName, status, imgUrl} = query;

  return {
    identifier,
    title,
    skuName,
    status,
    imgUrl
  };
}


export default connect(mapStateToProps)(Initiate);

