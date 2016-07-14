import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import classnames from 'classnames';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import ScrollLoad from '../../ui/ScrollLoad';
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

  render() {
    const {participantPagination, skuId, identifier} = this.props;
    const {list, isFetching, lastPage} = participantPagination;

    if (!list) {
      return null;
    }
    if (list.length === 0) {
      return (<div className="hb-list-border"></div>);
    }
    return (
      <ScrollLoad loadMore={this.loadMore}
                  hasMore={!lastPage}
                  isLoading={isFetching}
                  className={classnames({loading: isFetching})}
                  loader={<div className=""></div>}>
        <ul className="hb-list">
          {list.map((item) => {
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
                <li key={giftRecordId} className="row flex-items-middle">
                  <div className="col-4">
                    <img className="img-fluid img-circle" src={headpic} alt=""/>
                  </div>
                  <div className="col-13">
                    <div className="text-truncate">{nickName}</div>
                    <div className="text-muted f-sm">{perfect.formatDate(giftGainedDate)}</div>
                  </div>
                  <div className="col-7 text-right">
                    {giftAmount}元
                  </div>
                </li>
              );
            }

            // 抢到实物
            const title = giftStatus === 'NOT_GAIN' ? '大奖得主' : nickName;
            const gainedDate = giftStatus === 'NOT_GAIN' ? '等待揭晓' : perfect.formatDate(giftGainedDate);
            headpic = giftStatus === 'NOT_GAIN' ? championNotGain : headpic;
            const championHeader = giftStatus === 'NOT_GAIN' ? 'hb-champion-header gray' : 'hb-champion-header';

            return (
              <li key={giftRecordId} className="row flex-items-middle" style={{paddingTop: '1.2rem'}}>
                <div className="col-4">
                  <div className={championHeader}>
                    <img className="img-fluid img-circle" src={headpic} alt=""/>
                  </div>
                </div>
                <div className="col-14">
                  <div className="text-truncate">{title}</div>
                  <div className="text-muted f-sm">{gainedDate}</div>
                </div>

                <div className="col-4 p-a-0">
                  <Link to={`/product/detail/view/${skuId}?identifier=${identifier}`}>
                    <img className="img-fluid" src={skuIcon} alt={skuName}/>
                  </Link>
                </div>
                <div className="col-2">
                  <Link to={`/product/detail/view/${skuId}?identifier=${identifier}`}>
                    <span className="arrow-hollow-right" style={{marginLeft: '-1.5rem'}}></span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollLoad>
    );
  }
}

HongbaoGainedList.propTypes = {
  hongbaoDetailAction: PropTypes.object,
  identifier: PropTypes.string,
  participantPagination: PropTypes.object,
  skuId: PropTypes.string,
};

export default HongbaoGainedList;
