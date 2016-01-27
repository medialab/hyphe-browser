import '../../css/browser/side-bar'

import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import { setWebentityStatus } from '../../actions/webentities'
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

  setStatus (status) {
    const { webentity, setWebentityStatus, serverUrl, corpusId } = this.props

    if (status !== 'DISCOVERED' && status === webentity.status) {
      // Click on current status = set to discovered
      status = 'DISCOVERED'
    }

    if (status === 'IN') {
      // Set to IN = go to "adjust" mode and validation triggers crawling
      alert('TODO trigger crawling')
    } else {
      setWebentityStatus(serverUrl, corpusId, status, webentity.id)
    }
  }

  renderStatusButton (status) {
    const { formatMessage } = this.context.intl
    const { webentity } = this.props

    return (
      <button
        className={ cx('btn btn-large btn-default', 'status-' + status.toLowerCase(), { 'active-status': status === webentity.status }) }
        title={ formatMessage({ id: 'corpus-status.' + status }) }
        onClick={ () => this.setStatus(status) }>
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
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object.isRequired
}

const mapStateToProps = ({ ui }) => ({ // eslint-disable-line
})

BrowserSideBar.contextTypes = {
  intl: intlShape
}

export default connect(mapStateToProps, { setWebentityStatus })(BrowserSideBar)
