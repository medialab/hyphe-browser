// this component is just a place holder for subforms
//
import '../../css/pane'

import React, { PropTypes } from 'react'

import HypheHeader from '../HypheHeader'
import HypheFooter from '../HypheFooter'

class Login extends React.Component {
  render () {
    return (
      <div className="window">
        <HypheHeader />
        <div className="window-content">
          <div className="pane-centered">
            { this.props.children  }
          </div>
        </div>
        <HypheFooter />
      </div>
    )
  }
}

Login.propTypes = {
  children: PropTypes.node
}

export default Login
