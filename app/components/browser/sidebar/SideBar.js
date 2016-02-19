import '../../../css/browser/side-bar'

import React, { PropTypes } from 'react'
import { webentityShape } from '../../../types'

import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import SideBarContext from './SideBarContext'
import SideBarTags from './SideBarTags'

import { setWebentityStatus, showAdjustWebentity } from '../../../actions/webentities'
import { getWebEntityActivityStatus } from '../../../utils/status'

class SideBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      tab: 'context'
    }
  }

  renderCrawlingStatus () {
    const { webentity } = this.props

    if (!webentity) {
      return <noscript />
    }

    return (
      <div>
        <h3><T id="crawling-status" /></h3>
        <strong><T id={ 'crawling-status.' + getWebEntityActivityStatus(webentity.toObject()) } /></strong>
      </div>
    )
  }

  setStatus (status) {
    const { webentity, setWebentityStatus, showAdjustWebentity, serverUrl, corpusId } = this.props

    if (status !== 'DISCOVERED' && status === webentity.get('status')) {
      // Click on current status = set to discovered
      status = 'DISCOVERED'
    }

    if (status === 'IN') {
      // Set to IN = go to "adjust" mode and validation triggers crawling
      showAdjustWebentity(webentity.get('id'), true)
    } else {
      setWebentityStatus(serverUrl, corpusId, status, webentity.get('id'))
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

  renderTabs () {
    return (
      <div className="sidebar-tabs">
        <div className="tab-group">
          <div
            className={ cx('tab-item', { active: this.state.tab === 'context' }) }
            onClick={ () => this.setState({ tab: 'context' }) }>
            <span><T id="sidebar.tab-context" /></span>
          </div>
          <div
            className={ cx('tab-item', { active: this.state.tab === 'tags' }) }
            onClick={ () => this.setState({ tab: 'tags' }) }>
            <span><T id="sidebar.tab-tags" /></span>
          </div>
        </div>
        { (this.state.tab === 'context') ? this.renderTabContext() : this.renderTabTags() }
      </div>
    )
  }

  renderTabContext () {
    return <SideBarContext serverUrl={ this.props.serverUrl } corpusId={ this.props.corpusId } webentity={ this.props.webentity } />
  }

  renderTabTags () {
    return <SideBarTags serverUrl={ this.props.serverUrl } corpusId={ this.props.corpusId } webentity={ this.props.webentity } />
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
        { this.renderTabs() }
      </aside>
    )
  }
}

SideBar.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: webentityShape,

  setWebentityStatus: PropTypes.func.isRequired,
  showAdjustWebentity: PropTypes.func.isRequired
}

const mapStateToProps = ({ ui }) => ({ // eslint-disable-line
})

SideBar.contextTypes = {
  intl: intlShape
}

export default connect(mapStateToProps, {
  setWebentityStatus,
  showAdjustWebentity
})(SideBar)
