import React from 'react';
import routeSetting from './routeSetting';
const {enterHandler} = routeSetting;

// 注意嵌套路由应该是相对路径，不能写成据对路径
export default {
  component: require('../containers/App').default,
  childRoutes: [
    {
      path: '/',
      indexRoute: {
        onEnter: () => enterHandler('home'),
        getComponent: (nextState, cb) => {
          return require.ensure([], (require) => {
            cb(null, require('../containers/HomePage').default)
          })
        }
      }
    },
    {
      path: '/initiate',
      onEnter: () => enterHandler('initiate'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/HomePage').default)
        })
      }
    },
    {
      path: '/product',
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/ProductPage').default)
        })
      },
      indexRoute: {
        onEnter: () => enterHandler('productList'),
        getComponent: (nextState, cb) => {
          return require.ensure([], (require) => {
            cb(null, require('../components/product/ProductList').default)
          })
        }
      },
      childRoutes: [
        {
          onEnter: () => enterHandler('product'),
          path: 'detail/:skuId',
          getComponent: (nextState, cb) => {
            require.ensure([], (require) => {
              cb(null, require('../components/product/Product').default)
            })
          }
        },
        {
          onEnter: () => enterHandler('productView'),
          path: 'detail/:view/:skuId',
          getComponent: (nextState, cb) => {
            require.ensure([], (require) => {
              cb(null, require('../components/product/Product').default)
            })
          }
        }
      ]
    },
    {
      path: '/category',
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/CategoryPage').default)
        })
      },
      indexRoute: {
        onEnter: () => enterHandler('categoryList'),
        getComponent: (nextState, cb) => {
          return require.ensure([], (require) => {
            cb(null, require('../components/category/CategoryList').default)
          })
        }
      },
      childRoutes: [
        {
          onEnter: () => enterHandler('category'),
          path: ':fromType/:categoryId', // categoryId = 类目id
          getComponent: (nextState, cb) => {
            require.ensure([], (require) => {
              cb(null, require('../components/category/ProductList').default)
            })
          }
        }
      ]
    },
    {
      path: '/authorize/:identifier',
      onEnter: () => enterHandler('authorize'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/AuthorizePage').default)
        })
      }
    },
    {
      path: '/unpack/:identifier',
      onEnter: () => enterHandler('unpack'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/UnpackPage').default)
        })
      }
    },
    {
      path: '/hongbao/detail/:identifier',
      onEnter: () => enterHandler('detail'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/HongbaoDetailPage').default)
        })
      }
    },
    {
      path: '/hongbao/detail/view/:identifier',
      onEnter: () => enterHandler('detailView'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/HongbaoDetailPage').default)
        })
      }
    },
    {
      path: '/my',
      onEnter: () => enterHandler('my'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/MyHongbaoPage').default)
        })
      }
    },
    {
      path: '/myaddress',
      onEnter: () => enterHandler('myaddress'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/userAddressList').default)
        })
      }
    },
    {
      path: '/addaddress',
      onEnter: () => enterHandler('addaddress'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/addAddress').default)
        })
      }
    },
    {
      path: '/editaddress/:index',
      onEnter: () => enterHandler('editaddress'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/addAddress').default)
        })
      }
    },
    {
      path: '/selectcity',
      onEnter: () => enterHandler('selectcity'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/selectcity').default)
        })
      }
    },
    {
      path: '/logistics/:giftRecordId',
      onEnter: () => enterHandler('logistics'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/logisticsInfo').default)
        })
      }
    },
    {
      path: '/help',
      onEnter: () => enterHandler('help'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/explain/Help').default)
        })
      }
    },
    {
      path: '/protocol',
      onEnter: () => enterHandler('protocol'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/explain/Protocol').default)
        })
      }
    },
    {
      path: '/guide',
      onEnter: () => enterHandler('guide'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/explain/Guide').default)
        })
      }
    },
    {
      path: '/strategy',
      onEnter: () => enterHandler('strategy'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/explain/Strategy').default)
        })
      }
    },
    {
      path: '/test/linder',
      onEnter: () => enterHandler('test'),
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/Test').default)
        })
      }
    },
    {
      onEnter: () => enterHandler('wishlist'),
      path: 'wishlist', // 心愿单
      getComponent: (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../components/explain/WishList').default)
        })
      }
    },
  ]
}
