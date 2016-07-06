import React, {Component, PropTypes} from 'react';
import ScrollLoad from '../../ui/ScrollLoad';
import perfect from '../../utils/perfect';

/**
 * 渲染获取者列表
 */
class HongbaoGainedList extends Component {
  constructor(props, context) {
    super(props, context);
    this.loadMore = this.loadMore.bind(this);
  }

  componentWillMount() {
    this.loadMore(true);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {participantPagination} = nextProps;
    const {list} = participantPagination;
    if (list) {
      return true;
    }
    return false;
  }

  loadMore(first) {
    const {hongbaoDetailAction, identifier} = this.props;
    const body = {
      identifier
    };
    hongbaoDetailAction.getParticipantList(body)
      .then((res) => {
        if (first) {
          this.props.delayShowFoot();
        }
      });
  }

  render() {
    const {participantPagination} = this.props;
    const {list, isFetching, lastPage} = participantPagination;

    if (list && list.length > 0) {
      return (
        <ScrollLoad loadMore={this.loadMore}
                    hasMore={!lastPage}
                    isLoading={isFetching}
                    loader={<div className=""></div>}>
          <ul className="hb-list">
            {list.map((item) => {
              let {giftRecordId, nickName, headpic, giftAmount, giftGainedDate, giftType} = item;
              giftAmount = (giftAmount / 100).toFixed(2);

              return (
                <li key={giftRecordId} className="row flex-items-middle">
                  <div className="col-4">
                    <img className="img-fluid img-circle" src={headpic} alt=""/>
                  </div>
                  <div className="col-13">
                    <div className="text-truncate">{nickName}</div>
                    <div className="text-muted f-sm">{perfect.formatDate(giftGainedDate)}</div>
                  </div>

                  {
                    giftType === 'CASH' ? (
                      <div className="col-7 text-right">
                        {giftAmount}元
                      </div>
                    ) : (
                      <div className="col-7 text-right">
                        <div>中奖啦</div>
                        <div className="text-warning"><i className="icon icon-champion"></i> 手气最佳</div>
                      </div>
                    )
                  }
                </li>
              );
            })}
          </ul>
        </ScrollLoad>
      );
    }
    return null;
  }
}

HongbaoGainedList.propTypes = {
  hongbaoDetailAction: PropTypes.object,
  identifier: PropTypes.string,
  participantPagination: PropTypes.object,
  delayShowFoot: PropTypes.func
};

export default HongbaoGainedList;
