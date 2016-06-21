import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import assign from 'lodash/assign';
import * as hongbaoActions from '../actions/hongbao';
import MyHongbao from '../components/hongbao/MyHongbao';

const entitykeys = ['sponsorPagination', 'receivePagination'];

function mapStateToProps(state, ownProps) {
  const {type} = ownProps.location.query;
  const {
    hongbao
  } = state;

  const lists = entitykeys.map(key => {
    const entityList = hongbao[key];
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

  let objects = {type};

  lists.forEach((item) => {
    assign(objects, item);
  });

  return objects;
}

function mapDispatchToProps(dispatch) {
  return {
    hongbaoActions: bindActionCreators(hongbaoActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyHongbao);

