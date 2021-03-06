import './BrowserLayout.styl'

import React, { useState } from 'react'
import cx from 'classnames'
import { FormattedMessage as T, useIntl } from 'react-intl'

import StackListContainer from '../StackListContainer'
import WebentityBrowseContainer from '../WebentityBrowseContainer'
import HelpPin from '../../components/HelpPin'

import BrowserHeader from '../../components/BrowserHeader'
import BrowserTabsContainer from '../BrowserTabsContainer'
import HypheView from './HypheView'
import Spinner from '../../components/Spinner'
import { compareUrls } from '../../utils/lru'

const BrowserLayout = ({
  webentity,
  corpus,
  status,
  instanceUrl,
  isLanding,
  // actions
  openTab,

  selectedStack,
}) => {

  /**
   * lists management
   */
  const [asideMode, setAsideMode] = useState(isLanding ? 'stackList' : 'webentityBrowse')
  const [browserMode, setBrowserMode] = useState('browse')

  const { formatMessage } = useIntl()

  const handleOpenTabFromHyphe = (url) => {
    const isExternalUrl = !compareUrls(url, hypheUrl)
    if (isExternalUrl) {
      setBrowserMode('browse')
      openTab({ url })
    }
    return isExternalUrl
  }

  const hypheUrl = instanceUrl + '/#/project/' + corpus.corpus_id + '/network'

  const { ready } = status && status.corpus

  const formatStackName = stackName => {
    if (stackName === 'DISCOVERED') {
      return 'SUGGESTIONS'
    }
    return stackName
  }

  return (
    <div className="browser-layout">
      <BrowserHeader
        corpus={ corpus }
        status={ status }
        browserMode={ browserMode }
        onSetBrowserMode={ setBrowserMode }
      />
      {ready ?
        <div
          className="browser-main-container"
          style={ browserMode === 'browse' ? {} : { display: 'none' } }
        >
          <aside className="browser-column browser-aside-column">
            <ul className="aside-header switch-mode-container">
              <li><button onClick={ () => setAsideMode('stackList') } className={ cx('mode-btn', { 'is-active': (asideMode === 'stackList' || isLanding) }) }>
                <span className="switch-mode-title">
                  <span
                    className={ cx('current-stack-indicator hint--right', selectedStack) }
                    aria-label={ formatMessage({ id: 'overview-location' }, { status: formatStackName(selectedStack) }) }
                  >
                    <i className="ti-menu" />
                  </span>
                  <span className="switch-mode-title-text">
                    <T id="sidebar.inquiry-overview" />
                  </span>

                  <HelpPin>{formatMessage({ id: 'sidebar.inquiry-overview-help' })}</HelpPin></span></button>
              </li>
              <li>
                <button disabled={ isLanding } onClick={ () => setAsideMode('webentityBrowse') } className={ cx('mode-btn', { 'is-active': (asideMode === 'webentityBrowse' && !isLanding) }) }>
                  <span className="switch-mode-title">
                    <span
                      className={ cx('current-stack-indicator hint--bottom', webentity && webentity.status) }
                      aria-label={ formatMessage({ id: 'currently-browsed-webentity-location' }, { status: formatStackName(webentity && webentity.status) }) }
                    >
                      <i className="ti-desktop" />
                    </span>
                    <span className="switch-mode-title-text">
                      <T id="sidebar.browsed-webentity" />
                    </span>

                    <HelpPin>{formatMessage({ id: 'sidebar.browsed-webentity-help' })}</HelpPin>
                  </span>
                </button>
              </li>
            </ul>
            <div className="aside-content" style={ (asideMode === 'webentityBrowse' && !isLanding) ? {} : { display: 'none' } }>
              <WebentityBrowseContainer />
            </div>
            <div className="aside-content" style={ (asideMode === 'stackList' || isLanding) ? {} : { display: 'none' } }>
              <StackListContainer
                setAsideMode={ setAsideMode }
              />
            </div>
          </aside>
          <section className="browser-column browser-main-column">
            <BrowserTabsContainer setAsideMode={ setAsideMode } />
          </section>
        </div> :
        <div className="spinner-container">
          <Spinner />
        </div>
      }

      <HypheView
        style={ browserMode === 'hyphe' ? {} : { display: 'none' } }
        isHypheView={ browserMode === 'hyphe' }
        url={ hypheUrl } onOpenTabFromHyphe={ handleOpenTabFromHyphe }
      />
    </div>
  )
}

export default BrowserLayout
