// import './BrowserLayout.styl'

import React, { useState } from 'react'

import AsideLayout from './AsideLayout'
import BrowserHeader from './BrowserHeader'
import BrowserTabsContainer from '../BrowserTabsContainer'
import HypheView from './HypheView'

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
  
  // const [selectedList, setSelectedListReal] = useState(listStatus)
  // const [isOpen, setOpen] = useState(false)

  // const setSelectedList = l => {
  //   if (l === selectedList) {
  //     setOpen(!isOpen)
  //   } else {
  //     setSelectedListReal(l)
  //     setOpen(false)
  //   }
  //   resetActions()
  // }

  // TODO: save in redux state
  // const hasPendingActions = false

  const onSetAsideMode = mode => setAsideMode(mode)

  const handleOpenTabFromHyphe = (url) => {
    setBrowserMode('browse')
    openTab(url)
  }
  const hypheUrl = instanceUrl + '/#/project/' + corpus.corpus_id + '/network'

  return (
    <div className="browser-layout">
      <BrowserHeader 
        corpus={ corpus }
        status={ status }
        browserMode={ browserMode }
        onSelectStack={ onSelectStack }
        onSetBrowserMode={ setBrowserMode } />
      
      <div 
        className="browser-main-container"
        style={ browserMode === 'browse' ? {}: { display: 'none' } }>
        <AsideLayout { ...{ 
          isLanding,
          isEmpty,
          asideMode: isLanding ? 'stackList' : asideMode,
          onSetAsideMode
        } } />
        <section className="browser-column browser-main-column">
          <BrowserTabsContainer />
        </section>
      </div>
      <HypheView 
        style={ browserMode === 'hyphe' ? {} : { display: 'none' }  }
        isHypheView={ browserMode === 'hyphe' }
        url={ hypheUrl } onOpenTabFromHyphe={ handleOpenTabFromHyphe } />
    </div>
  )
}

export default BrowserLayout