import React, {Component, PropTypes} from 'react';
import BottomNav from '../BottomNav';
import ReceiveHongbao from './ReceiveHongbao';
import SponsorHongbao from './SponsorHongbao';

class MyHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: props.type || 'receive'
    };
    this.switchTab = this.switchTab.bind(this);
  }

  componentDidMount() {
    const {hongbaoActions} = this.props;

    const body = {
      requestNo: '444',
      accountType: 'WALLET',
      accountId: '33'
    };

    hongbaoActions.getUserInfo(body);
  }

  switchTab(e, type) {
    this.setState({
      type
    });
    history.replaceState(null, null, `?type=${type}`);
  }

  render() {
    const {type} = this.state;
    const {hongbaoActions, receivePagination, sponsorPagination, userInfo} = this.props;
    
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
          {type === 'receive' ?
            (<ReceiveHongbao hongbaoActions={hongbaoActions} receivePagination={receivePagination}
                             userInfo={userInfo}/>) :
            (<SponsorHongbao hongbaoActions={hongbaoActions} sponsorPagination={sponsorPagination}
                             userInfo={userInfo}/>)}
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
  userInfo: PropTypes.object,
  type: PropTypes.string
};

export default MyHongbao;
