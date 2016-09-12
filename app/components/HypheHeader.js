// black stripe at the top of the app
import './../css/hyphe-header'

import React, { PropTypes } from 'react'

class HypheHeader extends React.Component {
  render () {
    return (
      <header className="hyphe-header">
        Hyphe Browser
      </header>
    )
  }
}

HypheHeader.propTypes = {
}

export default HypheHeader

