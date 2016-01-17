import '../../css/browser/side-bar'

import React from 'react'

import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'

class BrowserSideBar extends React.Component {
  render () {
    const { formatMessage } = this.context.intl

    return (
      <aside className="browser-side-bar">
        <h2><T id="status" /></h2>
        <div className="btn-group browser-side-bar-status">
          <button className="btn btn-large btn-default status-in" title={ formatMessage({ id: 'corpus-status.IN' }) }>
            IN
          </button>
          <button className="btn btn-large btn-default status-undecided" title={ formatMessage({ id: 'corpus-status.UNDECIDED' }) }>
            ?
          </button>
          <button className="btn btn-large btn-default status-out" title={ formatMessage({ id: 'corpus-status.OUT' }) }>
            Out
          </button>
        </div>
      </aside>
    )
  }
}

BrowserSideBar.propTypes = {
}

const mapStateToProps = ({ ui }) => ({ // eslint-disable-line
})

BrowserSideBar.contextTypes = {
  intl: intlShape
}

export default connect(mapStateToProps)(BrowserSideBar)
