import React, {Component, PropTypes} from 'react';

//帮助按钮
class Help extends Component {
  constructor(props, context) {
    super(props, context);
    this.enterHelp = this.enterHelp.bind(this);
  }

  enterHelp() {
    this.context.router.push('/help');
  }

  render() {
    return (
      <div className="hb-help" onTouchTap={this.enterHelp}>
        <i className="hb-help-icon"></i>
      </div>
    );
  }
}

Help.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Help;
