import '../../css/pane'

import React from 'react'

export default (props) => {

  // all forms are displayed in pane-centered
  return (
    <div className="pane-centered">
      { props.children  }
    </div>
  )

}

