import '../../../css/browser/side-bar'

import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import Button from '../../Button'
import HypheFooter from './../../HypheFooter'
import SideBarContext from './SideBarContext'
import SideBarTags from './SideBarTags'

import { setWebentityStatus, showAdjustWebentity, setWebentityHomepage } from '../../../actions/webentities'
import { setTabUrl } from '../../../actions/tabs'
import { getWebEntityActivityStatus } from '../../../utils/status'

class SideBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      tab: 'tags'
    }
  }

  setStatus (status) {
    const { webentity, setWebentityStatus, showAdjustWebentity, serverUrl, corpusId } = this.props

    if (status !== 'DISCOVERED' && status === webentity.status) {
      // Click on current status = set to discovered
      status = 'DISCOVERED'
    }

    if (status === 'IN') {
      // Set to IN = go to "adjust" mode and validation triggers crawling
      showAdjustWebentity(webentity.id, true)
    } else {
      setWebentityStatus(serverUrl, corpusId, status, webentity.id)
    }
  }

  renderInfo () {
    const { webentity } = this.props
    if (!webentity) return null

    return (
      <div className="browser-side-bar-info">
        <h3><span>Info</span></h3>
        { webentity.created && <div class="webentity-created"><T id="webentity-info-created" /></div> }
        <div><T id="indegree" /> <strong>{ webentity.indegree }</strong></div>
        <div><T id="crawling-status" /> <strong><T id={ 'crawling-status.' + getWebEntityActivityStatus(webentity) } /></strong></div>
      </div>
    )
  }

  renderStatus () {
    const { webentity } = this.props
    if (!webentity) return null

    return (
      <div className="browser-side-bar-status">
        <h3><span><T id="status" /></span></h3>
        <div>
          { this.renderStatusButton('UNDECIDED') }
          { this.renderStatusButton('IN') }
          { this.renderStatusButton('OUT') }
        </div>
      </div>
    )
  }

  renderStatusButton (status) {
    const { formatMessage } = this.context.intl
    const { webentity } = this.props

    return (
      <button
        className={ cx('btn btn-default', 'status-' + status.toLowerCase(), { 'active-status': status === webentity.status }) }
        title={ formatMessage({ id: 'corpus-status.' + status }) }
        onClick={ () => this.setStatus(status) }>
        <span>{ formatMessage({ id: 'corpus-status.' + status })[0].toUpperCase() }</span>
      </button>
    )
  }

  renderTabs () {
    return (
      <div className="browser-side-bar-tabs">
         { false &&
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
        }
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

  renderHomepage () {
    const { webentity, setTabUrl, url, tabId, serverUrl, corpusId } = this.props
    const { formatMessage } = this.context.intl
    const disabled = `${webentity.homepage}/` === url

    return (
      <div className="browser-side-bar-homepage">
        <button className="btn btn-default browser-side-bar-homepage-url"
          title={ formatMessage({ id: 'goto-homepage' }, { url: webentity.homepage }) }
          disabled={ disabled }
          onClick={ () => setTabUrl(webentity.homepage, tabId) }>
          { webentity.homepage }
        </button>
        <Button icon="home" title={ formatMessage({ id: 'set-homepage' }, { url: url }) }
          disabled={ disabled }
          onClick={ () => setWebentityHomepage(serverUrl, corpusId, url, webentity.id) } />
      </div>
    )
  }

  render () {
    if (!this.props.webentity) {
      return (
        <aside className="browser-side-bar">
          <HypheFooter status={ this.props.status } />
        </aside>
      )
    }

    return (
      <aside className="browser-side-bar">
        { this.renderHomepage() }
        <div className="browser-side-bar-cols">
          { this.renderInfo() }
          { this.renderStatus() }
        </div>
        { this.renderTabs() }
        { this.props.disabled && <div className="browser-sidebar-disabled-layer" /> }
        <HypheFooter status={ this.props.status } />
      </aside>
    )
  }
}

SideBar.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object,
  disabled: PropTypes.bool,
  tabId: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,

  status: PropTypes.object,

  setTabUrl: PropTypes.func.isRequired,
  setWebentityHomepage: PropTypes.func.isRequired,
  setWebentityStatus: PropTypes.func.isRequired,
  showAdjustWebentity: PropTypes.func.isRequired
}

const mapStateToProps = ({ ui }) => ({ // eslint-disable-line
})

SideBar.contextTypes = {
  intl: intlShape
}

export default connect(mapStateToProps, {
  setTabUrl,
  setWebentityHomepage,
  setWebentityStatus,
  showAdjustWebentity
})(SideBar)
