// this component is just a place holder for subforms
//
import '../../css/pane'

import React, { PropTypes } from 'react'

const Login = (props) => (
  <div className="window">
    <div className="window-content">
      <div className="pane-centered">
        { props.children  }
      </div>
    </div>
  </div>
)

Login.propTypes = {
  children: PropTypes.node
}

export default Login
