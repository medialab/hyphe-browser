import '../../css/browser/side-bar'

import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'

import { getWebEntityActivityStatus } from '../../utils/status'


class BrowserSideBar extends React.Component {
  renderCrawlingStatus () {
    const { webentity } = this.props

    return (
      <div>
        <h3><T id="crawling-status" /></h3>
        <strong><T id={ "crawling-status." + getWebEntityActivityStatus(webentity) } /></strong>
      </div>
    )
  }

  render () {
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
        { this.renderCrawlingStatus() }
      </aside>
    )
  }
}

BrowserSideBar.propTypes = {
  webentity: PropTypes.object.isRequired
}

const mapStateToProps = ({ ui }) => ({ // eslint-disable-line
})

BrowserSideBar.contextTypes = {
  intl: intlShape
}

export default connect(mapStateToProps)(BrowserSideBar)
