import React, { PropTypes } from 'react'

import { connect } from 'react-redux'

class BrowserSideBar extends React.Component {
  render () {
    return (
      <aside>
        Sidebar Content
      </aside>
    )
  }
}

BrowserSideBar.propTypes = {
}

const mapStateToProps = ({ ui }) => ({
})

export default connect(mapStateToProps)(BrowserSideBar)

