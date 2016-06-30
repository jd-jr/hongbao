import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import assign from 'lodash/assign';
import HongbaoDetail from '../components/hongbao/HongbaoDetail';
import * as hongbaoDetailAction from '../actions/hongbaoDetail';

// 红包详情
const entitykeys = ['participantPagination'];

function mapStateToProps(state, ownProps) {
  const {identifier} = ownProps.params;

  const {
    hongbaoDetail,
    entity: {hongbaoInfo}
  } = state;

  const lists = entitykeys.map(key => {
    const entityList = hongbaoDetail[key];
    let entityPagination = assign({}, entityList);
    let {ids, entity} = entityList;
    if (ids) {
      entityPagination.list = ids.map(id => entity[id]);
    }

    delete entityPagination.ids;
    delete entityPagination.entity;
    return {
      [key]: entityPagination
    };
  });

  let objects = {
    identifier,
    hongbaoInfo: hongbaoInfo || {}
  };

  lists.forEach((item) => {
    assign(objects, item);
  });

  return objects;
}

function mapDispatchToProps(dispatch) {
  return {
    hongbaoDetailAction: bindActionCreators(hongbaoDetailAction, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HongbaoDetail);

