import React from 'react'
import cx from 'classnames'

// import ListLayout from './ListLayout'
import WebentityBrowseContainer from '../WebentityBrowseContainer'
import HelpPin from '../../components/HelpPin'

const AsideLayout = function ({
  isLanding,
  isEmpty,
  asideMode,
  onSetAsideMode
}) {

  return (
    <aside className="browser-column browser-aside-column">
      <ul className="aside-header switch-mode-container">
        <li><button onClick={ () => onSetAsideMode('stackList') } className={ cx('mode-btn', { 'is-active': asideMode === 'stackList' }) }>
          <span>Inquiry overview <HelpPin>review and curate the webentities constituting your inquiry</HelpPin></span></button>
        </li>
        <li><button disabled={ isLanding } onClick={ () => onSetAsideMode('webentityBrowse') } className={ cx('mode-btn', { 'is-active': asideMode === 'webentityBrowse' }) }>
          <span>Browsed webentity <HelpPin>edit information about the currently browsed webentity</HelpPin></span></button>
        </li>
      </ul>
      <div className="aside-content">
        {asideMode === 'webentityBrowse' && <WebentityBrowseContainer />}
      </div>
    </aside>
  )
}

export default AsideLayout
