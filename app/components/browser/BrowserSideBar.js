import '../../css/browser/side-bar'

import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

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

  renderStatusButton (status) {
    const { formatMessage } = this.context.intl
    const { webentity } = this.props

    return (
      <button
        className={ cx('btn btn-large btn-default', 'status-' + status.toLowerCase(), { 'active-status': status === webentity.status }) }
        title={ formatMessage({ id: 'corpus-status.' + status }) }>
        <T id={ 'corpus-status-label.' + status } />
      </button>
    )
  }

  render () {
    return (
      <aside className="browser-side-bar">
        <h2><T id="status" /></h2>
        <div className="btn-group browser-side-bar-status">
          { this.renderStatusButton('IN') }
          { this.renderStatusButton('UNDECIDED') }
          { this.renderStatusButton('OUT') }
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
