import React, {Component, PropTypes} from 'react';

class Loading extends Component {
  render() {
    const {loadingLabel, loadingStatus} = this.props;
    return (
      <div style={{display: loadingStatus ? 'block' : 'none'}}>
        <div className="loading-backdrop"></div>
        <div className="loading-icon">{loadingLabel}</div>
      </div>
    );
  }
}

Loading.defaultProps = {
  loadingLabel: '加载中...',
  loadingStatus: true
};

Loading.propTypes = {
  loadingLabel: PropTypes.string,
  loadingStatus: PropTypes.bool,
};

export default Loading;
