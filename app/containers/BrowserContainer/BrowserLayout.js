// import './BrowserLayout.styl'

import React, { useState, useEffect } from 'react'

import AsideLayout from './AsideLayout'
import BrowserHeader from './BrowserHeader'
import BrowserTabsContainer from '../BrowserTabsContainer'
import Modal from 'react-modal'
import HypheView from './HypheView'


const BrowserLayout = ({
  corpus,
  serverStatus,
  browserMode,
  instanceUrl,
  isEmpty,
  isLanding,
  // actions
  setBrowserMode,
  openTab
}) => {
  /**
   * lists management
   */
  const [asideMode, setAsideMode] = useState(isLanding ? 'stackList' : 'webeneityBrowse')
  
  // const [selectedList, setSelectedListReal] = useState(status)
  // const [isOpen, setOpen] = useState(false)
  const [actionsPendingModalOpen, setActionsPendingModalOpen] = useState(false)

  // const setSelectedList = l => {
  //   if (l === selectedList) {
  //     setOpen(!isOpen)
  //   } else {
  //     setSelectedListReal(l)
  //     setOpen(false)
  //   }
  //   resetActions()
  // }

  useEffect(() => {
    if (isLanding) {
      setAsideMode('stackList')
    }
  }, [isLanding])

  // TODO: save in redux state
  // const hasPendingActions = [mergeActions, outActions, undecidedActions].find(l => Object.keys(l).find(k => l[k])) !== undefined
  const hasPendingActions = false

  const onSetAsideMode = mode => {
    if (mode === 'webeneityBrowse') {
      if (hasPendingActions) {
        setActionsPendingModalOpen(true)
      } else {
        setAsideMode(mode)
      }
    } else {
      setAsideMode(mode)
    }
  }

  const onCloseActionsPendingModalOpen = () => {
    setActionsPendingModalOpen(false)
    setAsideMode('webentityBrowse')
  }
  
  const handleOpenTabFromHyphe = (url) => {
    setBrowserMode('browse')
    openTab(url)
  }
  const hypheUrl = instanceUrl + '/#/project/' + corpus.corpus_id + '/network'

  return (
    <div className="browser-layout">
      <BrowserHeader 
        corpus={ corpus }
        status={ serverStatus }
        browserMode={ browserMode }
        onSetBrowserMode={ setBrowserMode } />
      {
        browserMode === 'browse' ?
          <div className="browser-main-container">
            <AsideLayout { ...{ 
              isLanding,
              isEmpty,
              asideMode,
              onSetAsideMode
            } } />
            <section className="browser-column browser-main-column">
              <BrowserTabsContainer />
            </section>
          </div> :
          <HypheView url={ hypheUrl } onOpenTabFromHyphe={ handleOpenTabFromHyphe } />
      }
      <Modal
        isOpen={ actionsPendingModalOpen }
        onRequestClose={ onCloseActionsPendingModalOpen }
        contentLabel="Pending actions"
        style={ {
          content: {
            width: 700,
            maxWidth: '90vw',
            position: 'relative',
            top: 0,
            left: 0,
            overflow: 'hidden',
            padding: 0
          }
        } }
      >
        <div className="pending-actions-modal-container">
          <div className="modal-header">
            <h2><span>Unresolved decisions on webentities</span><i onClick={ onCloseActionsPendingModalOpen } className="ti-close" /></h2>
          </div>
          <div className="modal-body">
            You have unresolved decisions (2 webentities to put to OUT, 3 to UNDECIDED) in the webentities list. What do you want to do ?
          </div>
          <div className="modal-footer">
            <ul className="actions-container big">
              <li><button onClick={ onCloseActionsPendingModalOpen } className="btn btn-danger">cancel</button></li>
              <li><button onClick={ onCloseActionsPendingModalOpen } className="btn btn-success">apply decisions</button></li>
              <li><button onClick={ onCloseActionsPendingModalOpen } className="btn btn-success">discard decisions</button></li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default BrowserLayout