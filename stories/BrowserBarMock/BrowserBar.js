import './BrowserBar.styl'
import React, { useState, useRef } from 'react'
import cx from 'classnames'
import '../../app/containers/BrowserTabs/browser-tab-url-field.styl'
import '../../app/containers/BrowserTabs/browser-tab-label.styl'
import '../../app/containers/BrowserTabs/browser-tab-content.styl'
import '../../app/containers/BrowserTabs/browser-tabs.styl'

const BrowserBar = function ({
  displayAddButton,
  isHomePage,
  isLanding,
  edited,
  setEdited
}) {
  const input = useRef(null)
  const handleFormClick = () => {
    if (!edited) {
      setEdited(true)
      setTimeout(() => input.current.focus())
    }
  }
  return (
    <div className="browser-bar">
      <div className="browser-tab-toolbar-navigation">
        <button className="btn btn-default  hint--left" aria-label="Previous page">
          <span className="ti-angle-left" />
        </button><button className="btn btn-default  hint--left" aria-label="Next page" disabled="">
          <span className="ti-angle-right" />
        </button>
        <button className="btn btn-default  hint--left" aria-label="Refresh">
          <span className="ti-reload" />
        </button>
      </div>
      <div className={ cx('browser-tab-toolbar-url', { edited }) }>
        <form onClick={ handleFormClick } className="">
          {edited ?
            <input ref={ input } onBlur={ () => setEdited(false) } value={ isLanding ? '' : 'https://fr.wikipedia.org/wiki/La_Maison_des_feuilles' } />
            :
            isLanding ?
              <span className="toolbar-placeholder">You can directly write a URL address here</span>
              :
              <span className="browser-tab-url">
                <em>https</em>://<em>fr.wikipedia</em><em>.org</em><em>/wiki/La_Maison_des_feuilles</em>
              </span>
          }
        </form>
        <div className="page-actions">
          {
            !edited && displayAddButton
            &&
            <button className="create-btn hint--left" aria-label="Create a new entity distinct from the current one ...">
              <span className="ti-plus" />
            </button>
          }
          {
            !edited && !isLanding &&
            <button
              className={ cx('homepage-btn', 'hint--left', {
                'is-active': isHomePage
              }) } aria-label="Set this webpage as the homepage of the webentity 'La maison des feuilles'"
            >
              <span className="ti-layers-alt" />
            </button>
          }
          
          
        </div>
      </div>
    </div>
  )
}

const BrowserBarMockupContainer = ({
  displayAddButton = true,
  isHomePage = false,
  isLanding
}) => {
  const [edited, setEdited] = useState(false)
  return (
    <BrowserBar
      {
        ...{
          displayAddButton,
          isHomePage,
          isLanding,
          edited,
          setEdited,
        }
      }
    />
  )
}

export default BrowserBarMockupContainer