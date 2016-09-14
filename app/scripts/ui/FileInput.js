import React, {Component, PropTypes} from 'react';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';

class FileInput extends Component {
  static propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func,
    children: PropTypes.node
  };

  static defaultProps = {
    accept: '',
    multiple: true
  };

  handleChange = (e) => {
    if (this.props.onChange) {
      this.props.onChange(e);
    }
  };

  render() {
    const {className, accept, children, multiple} = this.props;
    //Android 不支持 multiple
    return (
      <div className={`fileinput-panel ${className}`}>
        {children}
        {
          deviceEnv.inIos ?
            (<input type="file" className="fileinput-file" accept={accept} multiple={multiple}
                    onChange={this.handleChange}/>)
            : (deviceEnv.inAndroid ? (<input type="file" className="fileinput-file" accept={accept}
                                             onChange={this.handleChange}/>) :
            (<input type="file" className="fileinput-file"
                    onChange={this.handleChange}/>))
        }
      </div>
    );
  }
}

export default FileInput;
