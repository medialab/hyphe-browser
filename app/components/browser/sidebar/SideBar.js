import '../../../css/browser/side-bar'

import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import Button from '../../Button'
import HypheFooter from './../../HypheFooter'
import SideBarContextualLists from './SideBarContextualLists'
import SideBarCategories from './SideBarCategories'
import SideBarFreetags from './SideBarFreetags'

import { setWebentityStatus, showAdjustWebentity, setWebentityHomepage, cancelWebentityCrawls } from '../../../actions/webentities'
import { setTabUrl } from '../../../actions/tabs'
import { toggleContext } from '../../../actions/browser'
import { getWebEntityActivityStatus } from '../../../utils/status'
import { compareUrls } from '../../../utils/lru'
import SideBarEgonetwork from './SideBarEgonetwork';

class SideBar extends React.Component {
  constructor (props) {
    super(props)
  }

  setStatus (status) {
    const { webentity, setWebentityStatus, showAdjustWebentity, serverUrl, corpusId, cancelWebentityCrawls } = this.props
    const crawling = !!~["PENDING", "RUNNING"].indexOf(getWebEntityActivityStatus(webentity))

    if (status !== 'DISCOVERED' && status === webentity.status) {
      // Click on current status = set to discovered
      status = 'DISCOVERED'
    }

    if (status === 'IN' && !crawling) {
      // Set to IN = go to "adjust" mode and validation triggers crawling
      showAdjustWebentity(webentity.id, true)
    } else {
      setWebentityStatus(serverUrl, corpusId, status, webentity.id)
    }

    if (status === 'OUT' && crawling) {
      cancelWebentityCrawls(serverUrl, corpusId, webentity.id)
    }
  }

  renderInfo () {
    const { webentity } = this.props
    if (!webentity) return null

    return (
      <div className="browser-side-bar-info">
        <h3><span><T id="info" /></span></h3>
        { webentity.created && <div className="webentity-created textinfo"><T id="webentity-info-created-sidebar" /></div> }
        <div className="textinfo"><T id="crawling-status" /> <strong><T id={ 'crawling-status.' + getWebEntityActivityStatus(webentity) } /></strong></div>
        <div className="textinfo"><T id="indegree" /> { webentity.indegree } WE{ webentity.indegree > 1 ? 's' : '' }</div>
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
          { this.renderStatusButton('IN') }
          { this.renderStatusButton('UNDECIDED') }
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
        <span>{ status === 'UNDECIDED' ? '?' : formatMessage({ id: 'corpus-status.' + status })[0].toUpperCase() }</span>
      </button>
    )
  }

  renderTabs () {
    const { showContext, toggleContext } = this.props
    const { formatMessage } = this.context.intl
    return (
      <div className="browser-side-bar-sections">
        { this.renderTabTags() }
        <h3 onClick={ () => toggleContext() }>
          <span>{ formatMessage({ id: 'context'}) }</span>
          <span className={ cx({
            'ti-angle-up': showContext,
            'ti-angle-down': !showContext
          }) }></span>
        </h3>
        { showContext && this.renderTabContext() }
        { this.renderFreetags() }
      </div>
    )
  }

  renderTabContext () {
    return <SideBarContextualLists serverUrl={ this.props.serverUrl }
      corpusId={ this.props.corpusId } webentity={ this.props.webentity } />
  }

  renderTabTags () {
    return <SideBarCategories serverUrl={ this.props.serverUrl }
      corpusId={ this.props.corpusId } webentity={ this.props.webentity } />
  }

  renderFreetags () {
    return <SideBarFreetags serverUrl={ this.props.serverUrl }
      corpusId={ this.props.corpusId } webentity={ this.props.webentity } />
  }

  renderNetwork () {
    return <SideBarEgonetwork serverUrl={ this.props.serverUrl }
      corpusId={ this.props.corpusId } webentity={ this.props.webentity } />
  }

  renderHomepage () {
    const { webentity, setTabUrl, url, tabId, serverUrl, corpusId, setWebentityHomepage } = this.props
    const { formatMessage } = this.context.intl
    const onHomepage = compareUrls(webentity.homepage, url)

    return (
      <div className="browser-side-bar-homepage">
        <Button className="hint--bottom-right" icon="home"
          title={ formatMessage({ id: 'set-homepage' }) }
          disabled={ onHomepage }
          onClick={ () => setWebentityHomepage(serverUrl, corpusId, url, webentity.id) } />
        <button className={ cx("btn btn-default browser-side-bar-homepage-url hint--medium", {"hint--bottom": !onHomepage && webentity.homepage}, {inactive: onHomepage || !webentity.homepage}) }
          aria-label={ !onHomepage && webentity.homepage && formatMessage({ id: 'goto-homepage' }, { url: webentity.homepage }) }
          onClick={ !onHomepage && webentity.homepage ? () => setTabUrl(webentity.homepage, tabId) : undefined }>
          <div disabled={onHomepage || !webentity.homepage}>
            { onHomepage ? formatMessage({ id: 'here-homepage' }) : webentity.homepage || formatMessage({ id: 'missing-homepage' }) }
          </div>
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
          { this.renderNetwork() }
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
  showContext: PropTypes.bool.isRequired,

  // actions
  setTabUrl: PropTypes.func.isRequired,
  setWebentityHomepage: PropTypes.func.isRequired,
  setWebentityStatus: PropTypes.func.isRequired,
  cancelWebentityCrawls: PropTypes.func.isRequired,
  showAdjustWebentity: PropTypes.func.isRequired,
  toggleContext: PropTypes.func.isRequired
}

const mapStateToProps = ({ ui, intl: { locale } }) => ({
  showContext: ui.showContext,
  locale
})

export default connect(mapStateToProps, {
  setTabUrl,
  setWebentityHomepage,
  setWebentityStatus,
  cancelWebentityCrawls,
  showAdjustWebentity,
  toggleContext
})(SideBar)
