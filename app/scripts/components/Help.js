import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

//帮助按钮
const Help = function() {
  return (
    <div className="hb-help">
      <Link to="/help">
        <i className="hb-help-icon"></i>
      </Link>
    </div>
  );
};

export default Help;
