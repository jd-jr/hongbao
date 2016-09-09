import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as categoryActions from '../actions/category';
import * as indexActions from '../actions/index';

class CategoryPage extends Component {
  render() {
    const {
      children, location, indexActions, categoryActions, subjectList, categoryList, productPagination,
      activeTab, priceOrder, fromType, categoryId, selectedProduct, skuId, view, productDetail, listType,
    } = this.props;

    return (
      <div>
        {children && React.cloneElement(children, {
          key: location.pathname,
          indexActions,
          categoryActions,
          subjectList,
          categoryList,
          productPagination,
          activeTab,
          priceOrder,
          fromType,
          categoryId,
          selectedProduct,
          listType,
          productDetail: productDetail || {},
          skuId,
          view,
        })}
      </div>
    );
  }
}

CategoryPage.propTypes = {
  children: PropTypes.node,
  location: PropTypes.object,
  entity: PropTypes.object,
  indexActions: PropTypes.object,
  categoryActions: PropTypes.object,
  subjectList: PropTypes.object,
  categoryList: PropTypes.object,
  productPagination: PropTypes.object,
  activeTab: PropTypes.string,
  priceOrder: PropTypes.string,
  selectedProduct: PropTypes.string,
  listType: PropTypes.string,
  fromType: PropTypes.string,
  categoryId: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  productDetail: PropTypes.object,
  skuId: PropTypes.string,
  view: PropTypes.string,
};

function mapStateToProps(state, ownProps) {
  // categoryId = 类目id,fromType = 来源(从分类进入|从主题进入)
  const {skuId, view, fromType, categoryId} = ownProps.params;
  const {
    entity: {subjectList, productDetail},
    category: {productPagination, categoryList, activeTab, priceOrder, selectedProduct, listType},
  } = state;

  let objects = {
    subjectList,
    categoryList,
    productPagination,
    activeTab,
    priceOrder,
    fromType,
    categoryId,
    selectedProduct,
    listType,
    productDetail: productDetail || {},
    skuId,
    view,
  };

  // const {entity} = state;
  // console.info(categoryId);

  return objects;
}

function mapDispatchToProps(dispatch) {
  return {
    categoryActions: bindActionCreators(categoryActions, dispatch),
    indexActions: bindActionCreators(indexActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPage);

