import './BrowserLayout.styl'

import React, {useState} from 'react'

import BrowserBar from '../BrowserBarMock'
import NewTabContent from '../NewTabContent'
import AsideLayout from './AsideLayout'
import BrowserHeader from './BrowserHeader'
import BrowserTabs from './BrowserTabs'
import Modal from 'react-modal'



const BrowserLayout = ({
  status,
  isEmpty,
  isLanding
}) => {
  /**
   * lists management
   */
  const [selectedList, setSelectedListReal] = useState(status)
  const [isOpen, setOpen] = useState(false)
  const [asideMode, setAsideMode] = useState(isLanding ? 'list' : 'browse')
  const [actionsPendingModalOpen, setActionsPendingModalOpen] = useState(false)
    
  const [mergeActions, setMergeActions] = useState({})
  const [outActions, setOutActions] = useState({})
  const [undecidedActions, setUndecidedActions] = useState({})
  const resetActions = () => {
    setMergeActions({})
    setOutActions({})
    setUndecidedActions({})
  }
  const setSelectedList = l => {
    if (l === selectedList) {
      setOpen(!isOpen)
    } else {
      setSelectedListReal(l)
      setOpen(false)
    }
    resetActions()
  }

  const hasPendingActions = [mergeActions, outActions, undecidedActions].find(l => Object.keys(l).find(k => l[k])) !== undefined

  const onSetAsideMode = mode => {
    if (mode === 'browse') {
      if (hasPendingActions) {
        setActionsPendingModalOpen(true);
      } else {
        setAsideMode(mode);
      }
    } else {
      setAsideMode(mode);
    }
  }

  const onCloseActionsPendingModalOpen = () => {
    setActionsPendingModalOpen(false);
    setAsideMode('browse');
  }
  
  return (
    <div className="browser-layout">
      <BrowserHeader />
      <div className="browser-main-container">
        <AsideLayout { ...{ 
          status, isLanding, isEmpty,

          hasPendingActions,
          setSelectedList,
          setUndecidedActions,
          setOutActions,
          setMergeActions,
          selectedList,
          isOpen,
          setOpen,
          mergeActions,
          outActions,
          undecidedActions,
          resetActions,
          asideMode,
          onSetAsideMode
        } } />
        <section className="browser-column browser-main-column">
          <BrowserTabs isEmpty={ isEmpty } />
          <BrowserBar isLanding={ isLanding } displayAddButton={ status === 'in' } />
          {
            isLanding ?
              <NewTabContent isEmpty={ isEmpty } />
              :
              <iframe className="webview" src="https://fr.wikipedia.org/wiki/La_Maison_des_feuilles" />
          }
        </section>
      </div>
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
            <h2><span>Unresolved actions on webentities</span><i onClick={ onCloseActionsPendingModalOpen } className="ti-close" /></h2>
          </div>
          <div className="modal-body">
            You have unresolved actions (2 OUT, 3 UNDEFINED) in the webentities list. What do you want to do ?
          </div>
          <div className="modal-footer">
            <ul className="actions-container big">
              <li><button onClick={ onCloseActionsPendingModalOpen } className="btn btn-danger">cancel</button></li>
              <li><button onClick={ onCloseActionsPendingModalOpen } className="btn btn-success">apply actions</button></li>
              <li><button onClick={ onCloseActionsPendingModalOpen } className="btn btn-success">discard actions</button></li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default BrowserLayout