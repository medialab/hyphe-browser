import '../../css/browser/side-bar'

import React, { PropTypes } from 'react'

import { connect } from 'react-redux'

class BrowserSideBar extends React.Component {
  render () {
    return (
      <aside className="browser-side-bar">
        <h2>Status</h2>
        <div className="btn-group browser-side-bar-status">
          <button className="btn btn-large btn-default status-in">
            IN
          </button>
          <button className="btn btn-large btn-default status-undecided">
            ?
          </button>
          <button className="btn btn-large btn-default status-out">
            Out
          </button>
        </div>
      </aside>
    )
  }
}

BrowserSideBar.propTypes = {
}

const mapStateToProps = ({ ui }) => ({
})

export default connect(mapStateToProps)(BrowserSideBar)

