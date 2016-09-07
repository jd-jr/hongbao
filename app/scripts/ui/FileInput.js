import React, {Component, PropTypes} from 'react';

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
    return (
      <div className={`fileinput-panel ${className}`}>
        {children}
        <input type="file" className="fileinput-file" accept={accept} multiple={multiple}
               onChange={this.handleChange}/>
      </div>
    );
  }
}

export default FileInput;
