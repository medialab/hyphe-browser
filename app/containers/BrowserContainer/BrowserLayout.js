import './BrowserLayout.styl'

import React, { useState, useEffect } from 'react'
import cx from 'classnames'

import StackListContainer from '../StackListContainer'
import WebentityBrowseContainer from '../WebentityBrowseContainer'
import HelpPin from '../../components/HelpPin'

import BrowserHeader from '../../components/BrowserHeader'
import BrowserTabsContainer from '../BrowserTabsContainer'
import HypheView from './HypheView'
import Spinner from '../../components/Spinner'

const BrowserLayout = ({
  corpus,
  status,
  instanceUrl,
  isEmpty,
  isLanding,
  // actions
  onSelectStack,
  openTab
}) => {
  /**
   * lists management
   */
  const [asideMode, setAsideMode] = useState(isLanding ? 'stackList' : 'webeneityBrowse')
  const [browserMode, setBrowserMode] = useState('browse')

  useEffect(() => {
    if (isLanding) {
      setAsideMode('stackList')
    }
  }, [isLanding])

  
  const onSetAsideMode = mode => setAsideMode(mode)

  const handleOpenTabFromHyphe = (url) => {
    setBrowserMode('browse')
    openTab(url)
  }
  const hypheUrl = instanceUrl + '/#/project/' + corpus.corpus_id + '/network'
  
  const { ready }= status && status.corpus

  return (
    <div className="browser-layout">
      <BrowserHeader 
        corpus={ corpus }
        status={ status }
        browserMode={ browserMode }
        onSelectStack={ onSelectStack }
        onSetBrowserMode={ setBrowserMode } />
      { ready ?
        <div 
          className="browser-main-container"
          style={ browserMode === 'browse' ? {}: { display: 'none' } }>
          <aside className="browser-column browser-aside-column">
            <ul className="aside-header switch-mode-container">
              <li><button onClick={ () => onSetAsideMode('stackList') } className={ cx('mode-btn', { 'is-active': asideMode === 'stackList' }) }>
                <span>Inquiry overview <HelpPin>review and curate the webentities constituting your inquiry</HelpPin></span></button>
              </li>
              <li><button disabled={ isLanding } onClick={ () => onSetAsideMode('webentityBrowse') } className={ cx('mode-btn', { 'is-active': asideMode === 'webentityBrowse' }) }>
                <span>Browsed webentity <HelpPin>edit information about the currently browsed webentity</HelpPin></span></button>
              </li>
            </ul>
            <div className="aside-content" style={ asideMode === 'webentityBrowse' ? {}: { display: 'none' } }>
              <WebentityBrowseContainer />
            </div>
            <div className="aside-content" style={ asideMode === 'stackList' ? {}: { display: 'none' } }>
              <StackListContainer
                isLanding={ isLanding } 
                isEmpty={ isEmpty } 
              />
            </div>
          </aside>
          <section className="browser-column browser-main-column">
            <BrowserTabsContainer />
          </section>
        </div>:
        <div className="spinner-container">
          <Spinner /> 
        </div>
      }
      
      <HypheView 
        style={ browserMode === 'hyphe' ? {} : { display: 'none' }  }
        isHypheView={ browserMode === 'hyphe' }
        url={ hypheUrl } onOpenTabFromHyphe={ handleOpenTabFromHyphe } />
    </div>
  )
}

export default BrowserLayout