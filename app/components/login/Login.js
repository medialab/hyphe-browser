// this component is just a place holder for subforms
//
import '../../css/pane'

import React, { PropTypes } from 'react'

const Login = (props) => {

  // all forms are displayed in pane-centered
  return (
    <div className="pane-centered">
      { props.children  }
    </div>
  )

}

Login.propTypes = {
  children: PropTypes.node
}

export default Login
