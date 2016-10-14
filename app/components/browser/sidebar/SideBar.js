import '../../../css/browser/side-bar'

import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import Button from '../../Button'
import HypheFooter from './../../HypheFooter'
import SideBarContextualLists from './SideBarContextualLists'
import SideBarTags from './SideBarTags'

import { setWebentityStatus, showAdjustWebentity, setWebentityHomepage } from '../../../actions/webentities'
import { setTabUrl } from '../../../actions/tabs'
import { getWebEntityActivityStatus } from '../../../utils/status'
import { compareUrls } from '../../../utils/lru'

class SideBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      section: 'tags'
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

  toggleSection () {
    this.setState({ section: this.state.section === 'tags' ? 'context' : 'tags' })
  }

  renderInfo () {
    const { webentity } = this.props
    if (!webentity) return null

    return (
      <div className="browser-side-bar-info">
        <h3><span>Info</span></h3>
        { webentity.created && <div className="webentity-created"><T id="webentity-info-created-sidebar" /></div> }
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
        className={ cx('btn btn-default hint--bottom', 'status-' + status.toLowerCase(), { 'active-status': status === webentity.status }) }
        aria-label={ formatMessage({ id: 'corpus-status.' + status }) }
        onClick={ () => this.setStatus(status) }>
        <span>{ formatMessage({ id: 'corpus-status.' + status })[0].toUpperCase() }</span>
      </button>
    )
  }

  renderTabs () {
    const { formatMessage } = this.context.intl
    return (
      <div className="browser-side-bar-sections">
        <h3 onClick={ () => this.toggleSection() }>
          <span>{ formatMessage({ id: 'context'}) }</span>
          <span className={ cx({
            'ti-angle-up': this.state.section === 'context',
            'ti-angle-down': this.state.section === 'tags'
          }) }></span>
        </h3>
        { this.state.section === 'context' && this.renderTabContext() }
        { this.renderTabTags() }
      </div>
    )
  }

  renderTabContext () {
    return <SideBarContextualLists serverUrl={ this.props.serverUrl }
      corpusId={ this.props.corpusId } webentity={ this.props.webentity } />
  }

  renderTabTags () {
    return <SideBarTags serverUrl={ this.props.serverUrl }
      corpusId={ this.props.corpusId } webentity={ this.props.webentity } />
  }

  renderHomepage () {
    const { webentity, setTabUrl, url, tabId, serverUrl, corpusId } = this.props
    const { formatMessage } = this.context.intl
    const onHomepage = compareUrls(webentity.homepage, url)

    return (
      <div className="browser-side-bar-homepage">
        <Button className="hint--bottom-right" icon="home"
          title={ formatMessage({ id: 'set-homepage' }) }
          disabled={ onHomepage }
          onClick={ () => setWebentityHomepage(serverUrl, corpusId, url, webentity.id) } />
        <button className={ cx("btn btn-default browser-side-bar-homepage-url", {"hint--bottom": !onHomepage && webentity.homepage}, {inactive: onHomepage || !webentity.homepage}) }
          aria-label={ !onHomepage && webentity.homepage && formatMessage({ id: 'goto-homepage' }, { url: webentity.homepage }) }
          onClick={ !onHomepage ? () => setTabUrl(webentity.homepage, tabId) : undefined }>
          <span disabled={onHomepage || !webentity.homepage}>
            { onHomepage ? formatMessage({ id: 'here-homepage' }) : webentity.homepage || formatMessage({ id: 'missing-homepage' }) }
          </span>
        </button>
      </div>
    )
  }

  render () {
    const { disabled, status, webentity } = this.props

    if (!webentity) {
      return (
        <aside className="browser-side-bar">
          <HypheFooter status={ status } />
        </aside>
      )
    }

    return (
      <aside className="browser-side-bar">
        <div className="browser-side-bar-scroll">
          { this.renderHomepage() }
          <div className="browser-side-bar-cols">
            { this.renderInfo() }
            { this.renderStatus() }
          </div>
          { this.renderTabs() }
          { disabled && <div className="browser-sidebar-disabled-layer" /> }
        </div>
        <HypheFooter status={ status } />
      </aside>
    )
  }
}

SideBar.contextTypes = {
  intl: intlShape
}

SideBar.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object,
  disabled: PropTypes.bool,
  tabId: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
  status: PropTypes.object,

  // actions
  setTabUrl: PropTypes.func.isRequired,
  setWebentityHomepage: PropTypes.func.isRequired,
  setWebentityStatus: PropTypes.func.isRequired,
  showAdjustWebentity: PropTypes.func.isRequired
}

const mapStateToProps = ({ intl: { locale } }) => ({
  locale
})

export default connect(mapStateToProps, {
  setTabUrl,
  setWebentityHomepage,
  setWebentityStatus,
  showAdjustWebentity
})(SideBar)
