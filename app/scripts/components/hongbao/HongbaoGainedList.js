import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import perfect from '../../utils/perfect';
import defaultHeadPic from '../../../images/headpic.png';
import championNotGain from '../../../images/champion-not-gain.png';
import {NICKNAME} from '../../constants/common';

/**
 * 渲染获取者列表
 */
class HongbaoGainedList extends Component {
  constructor(props, context) {
    super(props, context);
    this.loadMore = this.loadMore.bind(this);
    this.prize = this.prize.bind(this);

    //设置图片目录
    this.rootUrl = perfect.getLocationRoot() +'images/';
  }

  componentWillMount() {
    this.loadMore();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {participantPagination} = nextProps;
    const {list} = participantPagination;
    if (list) {
      return true;
    }
    return false;
  }

  loadMore() {
    const {hongbaoDetailAction, identifier} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    if (deviceEnv.inWx && !thirdAccId) {
      return;
    }
    const body = {
      identifier,
      accountType,
      thirdAccId
    };
    hongbaoDetailAction.getParticipantList(body);
  }

  //点击中奖图片埋点
  prize() {
    const {type, isUnpack} = this.props;
    //埋点
    perfect.setBuriedPoint(isUnpack ? `hongbao${type && type === 'sponsor' ? '_my' : ''}prize`
      : 'hongbao_received_prize');
  }

  render() {
    const {participantPagination, skuId, identifier} = this.props;
    const {list} = participantPagination;

    if (!list) {
      return null;
    }
    if (list.length === 0) {
      return (<div className="hb-list-border"></div>);
    }
    return (
      <ul className="hb-list">
        {list.map((item, index) => {
          // giftStatus 值为 'NOT_GAIN' 表示实物奖品还没有获取
          let {
            giftRecordId, nickName, headpic, giftAmount,
            giftGainedDate, giftType, giftStatus, skuName, skuIcon
          } = item;

          headpic = headpic || defaultHeadPic;
          nickName = nickName || NICKNAME;

          giftAmount = (giftAmount / 100).toFixed(2);
          if (giftType === 'CASH') { //抢到现金
            return (
              <li key={giftRecordId}>
                <div className="row">
                  <div className="col-4">
                    <img className="img-fluid img-circle" src={headpic} alt=""/>
                  </div>
                  <div className="col-13">
                    <div className="text-truncate">{nickName}</div>
                    <div className="text-muted f-sm">{perfect.formatDate({time: giftGainedDate})}</div>
                  </div>
                  <div className="col-7 text-right">
                    {giftAmount}元
                  </div>
                </div>
              </li>
            );
          }

          // 抢到实物
          const title = giftGainedDate ? nickName : '大奖得主';
          const gainedDate = giftGainedDate ? perfect.formatDate({time: giftGainedDate}) : '等待揭晓';
          headpic = giftGainedDate ? headpic : championNotGain;
          const championHeader = giftGainedDate ? 'hb-champion-header' : 'hb-champion-header gray';

          return (
            <li key={giftRecordId}>
              <div className={`row ${index === 0 ? ' flex-items-middle' : ''}`}>
                <div className="col-4">
                  <div className={championHeader} style={{marginTop: '5px'}}>
                    <img className="img-fluid img-circle" src={headpic} alt=""/>
                  </div>
                </div>
                <div className="col-14">
                  <div className="text-truncate">{title}</div>
                  <div className="text-muted f-sm">{gainedDate}</div>
                </div>

                <div className="col-4 p-r-0" onTouchTap={this.prize}>
                  <Link to={`/product/detail/view/${skuId}`}>
                    <img className="img-fluid" src={skuIcon} alt={skuName}/>
                  </Link>
                </div>
                <div className="col-2 text-right" onTouchTap={this.prize}>
                  <Link to={`/product/detail/view/${skuId}`}>
                    <span className="arrow-hollow-right" style={{marginLeft: '-0.8rem'}}></span>
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
}

HongbaoGainedList.propTypes = {
  hongbaoDetailAction: PropTypes.object,
  identifier: PropTypes.string,
  participantPagination: PropTypes.object,
  skuId: PropTypes.string,
  type: PropTypes.string,
  isUnpack: PropTypes.bool
};

export default HongbaoGainedList;
