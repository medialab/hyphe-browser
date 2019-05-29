import './BrowserBar.styl'
import React, { useState, useRef } from 'react'
import cx from 'classnames'

const BrowserBar = function () {
  const [edited, setEdited] = useState(false)
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
            <input ref={ input } onBlur={ () => setEdited(false) } value="https://www.01net.com/tests" />
            :
            <span className="browser-tab-url">
              <em>https</em>://<em>www.01net</em><em>.com</em>/tests
            </span>
          }
        </form>
        <div className="page-actions">
          <span className="hint--left" aria-label="Set this page as the homepage of the entity">
            <span className="ti-layers-alt" />
          </span>
          <span className="hint--left" aria-label="Create a new entity distinct from the current one ...">
            <span className="ti-plus" />
          </span>
        </div>
      </div>
    </div>
  )
}

export default BrowserBar