import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import BottomNav from '../BottomNav';

class MyHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      detail: null,
      type: props.type || 'receive'
    };
    this.switchTab = this.switchTab.bind(this);
  }

  componentDidMount() {
    const {hongbaoActions} = this.props;
    const {type} = this.state;
    const body = {
      requestNo: '444',
      accountType: 'WALLET',
      accountId: '33'
    };

    hongbaoActions.getHongbaoList(body, type);
  }

  switchTab(e, type) {
    this.setState({
      type
    });
    history.replaceState(null, null, `?type=${type}`);
  }

  render() {
    const {type} = this.state;
    return (
      <div>
        <article className="hb-wrap-mb">
          <section className="hb-nav-btn-group row">
            <div className={`col-12 hb-nav-btn-left${type === 'receive' ? ' active' : ''}`}
                 onTouchTap={(e) => this.switchTab(e, 'receive')}>我收到的
            </div>
            <div className={`col-12 hb-nav-btn-right${type === 'sponsor' ? ' active' : ''}`}
                 onTouchTap={(e) => this.switchTab(e, 'sponsor')}>我发出的
            </div>
          </section>

          <section className="text-center m-t-2">
            <div>
              <img className="img-circle img-thumbnail hb-figure" alt=""/>
            </div>
            <h3 className="m-t-1">老王共收到</h3>
            <div className="h1">1900.00</div>

            <div>
              <button className="btn btn-primary btn-outline-primary hb-fillet-1">立即提现</button>
            </div>
          </section>

          <section className="row text-center m-t-1">
            <div className="col-10 text-primary">
              <div>已收红包</div>
              <div className="h1">173</div>
            </div>
            <div className="col-10 offset-4 text-muted">
              <div>手气最佳</div>
              <div className="h1">9</div>
            </div>
          </section>

          <section className="m-t-1">
            <ul className="hb-list arrow-hollow-top hb-arrows-active hb-arrows-active-right">
              <li>
                <Link className="hb-link-block row flex-items-middle" to="/hongbao/detail/received/99d877579e94e5cf">
                  <div className="col-18">
                    <div className="text-truncate">金刚狼</div>
                    <div className="text-muted f-sm">2016.05.18</div>
                  </div>
                  <div className="col-6 text-right">
                    0.24元
                  </div>
                </Link>
              </li>
              <li className="row flex-items-middle">
                <div className="col-18">
                  <div className="text-truncate">猩红女巫</div>
                  <div className="text-muted f-sm">05-29 18:03:02</div>
                </div>
                <div className="col-6 text-right">
                  0.28元
                </div>
              </li>
              <li className="row flex-items-middle">
                <div className="col-18">
                  <div className="text-truncate">老王cheerup</div>
                  <div className="text-muted f-sm">05-29 18:03:02</div>
                </div>
                <div className="col-6 text-right">
                  0.29元
                </div>
              </li>
              <li className="row flex-items-middle">
                <div className="col-18">
                  <div className="text-truncate">美国队长</div>
                  <div className="text-muted f-sm">05-29 18:03:02</div>
                </div>
                <div className="col-6 text-right">
                  0.25元
                </div>
              </li>
              <li className="row flex-items-middle">
                <div className="col-18">
                  <div className="text-truncate">金刚狼</div>
                  <div className="text-muted f-sm">05-29 18:03:02</div>
                </div>
                <div className="col-6 text-right">
                  33.28元
                </div>
              </li>
            </ul>
          </section>
        </article>

        <BottomNav type="receive"/>
      </div>
    );
  }
}

MyHongbao.contextTypes = {
  router: PropTypes.object.isRequired
};

MyHongbao.propTypes = {
  hongbaoActions: PropTypes.object,
  sponsorPagination: PropTypes.object,
  receivePagination: PropTypes.object,
  type: PropTypes.string
};

export default MyHongbao;
