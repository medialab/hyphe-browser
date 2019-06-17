import React, { useState } from 'react'
import cx from 'classnames'

import ListLayout from './ListLayout'
import BrowseLayout from './BrowseLayout'
import HelpPin from '../../app/components/HelpPin'

const AsideLayout = function ({
  status,
  isLanding,
  isEmpty,

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
}) {
      
  return (
    <aside className="browser-column browser-aside-column">
      <ul className="aside-header switch-mode-container">
        <li><button onClick={ () => onSetAsideMode('list') } className={ cx('mode-btn', { 'is-active': asideMode === 'list' }) }>
          <span>Inquiry overview <HelpPin>review and curate the webentities constituting your inquiry</HelpPin></span></button>
        </li>
        <li><button disabled={ isLanding } onClick={ () => onSetAsideMode('browse') } className={ cx('mode-btn', { 'is-active': asideMode === 'browse' }) }>
          <span>Browsed webentity <HelpPin>edit information about the currently browsed webentity</HelpPin></span></button>
        </li>
      </ul>
      <div className="aside-content">
        {
          asideMode === 'list' ?
            <ListLayout 
              isLanding={ isLanding } 
              isEmpty={ isEmpty } 
              status={ status } 
              {
                ...{
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
                  resetActions
                }
              }
            />
            :
            <BrowseLayout status={ status } />
        }
      </div>
    </aside>
  )
}

export default AsideLayout
