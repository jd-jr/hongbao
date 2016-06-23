import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import assign from 'lodash/assign';
import * as productActions from '../actions/product';

class ProductPage extends Component {
  render() {
    const {
      children, location, productActions, productPagination, categoryList,
      activeCategory, priceOrder, productDetail, skuId, view
    } = this.props;

    return (
      <div>
        {children && React.cloneElement(children, {
          key: location.pathname,
          productActions,
          productPagination,
          categoryList,
          activeCategory,
          priceOrder,
          productDetail,
          skuId,
          view
        })}
      </div>
    );
  }
}

ProductPage.propTypes = {
  children: PropTypes.node,
  entity: PropTypes.object,
  location: PropTypes.object,
  productActions: PropTypes.object,
  productPagination: PropTypes.object,
  categoryList: PropTypes.object,
  activeCategory: PropTypes.string,
  priceOrder: PropTypes.string,
  productDetail: PropTypes.object,
  skuId: PropTypes.string,
  view: PropTypes.string,
};

// 商品记录
const entitykeys = ['productPagination', 'categoryList'];

function mapStateToProps(state, ownProps) {
  const {skuId, view} = ownProps.params;
  const {
    product,
    entity: {productDetail}
  } = state;

  const {activeCategory, priceOrder} = product;

  const lists = entitykeys.map(key => {
    const entityList = product[key];
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
    activeCategory,
    priceOrder,
    productDetail: productDetail || {},
    skuId,
    view
  };

  lists.forEach((item) => {
    assign(objects, item);
  });

  return objects;
}

function mapDispatchToProps(dispatch) {
  return {
    productActions: bindActionCreators(productActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductPage);

