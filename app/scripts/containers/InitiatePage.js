import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Initiate from '../components/home/Initiate';
import prefect from '../utils/perfect';

function mapStateToProps(state, ownProps) {
  const {query} = ownProps.location;
  let {identifier, title, skuName, status, skuIcon, mystic} = query;

  skuIcon = prefect.setUrlProtocol(skuIcon);

  return {
    identifier,
    title,
    skuName,
    status,
    skuIcon,
    mystic
  };
}


export default connect(mapStateToProps)(Initiate);

