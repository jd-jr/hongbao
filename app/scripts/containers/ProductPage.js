import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as productActions from '../actions/product';

class ProductPage extends Component {
  render() {
    const {
      children, location, productActions, productPagination, categoryList,
      activeCategory, priceOrder, productDetail, skuId, view, selectedProduct
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
          selectedProduct,
          skuId,
          view,
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
  activeCategory: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  priceOrder: PropTypes.string,
  selectedProduct: PropTypes.string,
  productDetail: PropTypes.object,
  skuId: PropTypes.string,
  view: PropTypes.string,
};

function mapStateToProps(state, ownProps) {
  const {skuId, view} = ownProps.params;
  const {
    product: {productPagination, categoryList, activeCategory, priceOrder, selectedProduct},
    entity: {productDetail}
  } = state;

  let objects = {
    productPagination,
    categoryList,
    activeCategory,
    priceOrder,
    selectedProduct,
    productDetail: productDetail || {},
    skuId,
    view,
  };

  return objects;
}

function mapDispatchToProps(dispatch) {
  return {
    productActions: bindActionCreators(productActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductPage);

