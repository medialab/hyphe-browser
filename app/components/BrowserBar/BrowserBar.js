import './BrowserBar.styl'
import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

import cx from 'classnames'
import { isWebUri } from 'valid-url'
import { intlShape } from 'react-intl'

import { getSearchUrl } from '../../utils/search-web'

const BrowserBar = function ({
  initialUrl,
  selectedEngine,
  displayAddButton,
  isHomePage,
  isLanding,
  disableReload,
  disableBack,
  disableForward,
  onReload,
  onGoBack,
  onGoForward,
  onSetTabUrl
}, { intl }) {
  const { formatMessage } = intl

  const [edited, setEdited] = useState(false)
  const [tabUrl, setTabUrl] = useState(initialUrl)

  const input = useRef(null)

  useEffect(() => {
    if (initialUrl !== tabUrl) {
      setTabUrl(initialUrl)
    }
  }, [initialUrl])

  const handleFormClick = () => {
    if (!edited) {
      setEdited(true)
      setTimeout(() => input.current.focus())
    }
  }

  const handleKeyUp = (e) => {
    if (e.keyCode === 27) { // ESCAPE
      e.target.blur()
      setTabUrl(initialUrl)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setEdited(false)
    const url = ((u) => {
      if (!isWebUri(u)) {
        const httpu = 'http://' + u
        if (isWebUri(httpu)) {
          setTabUrl(httpu)
          return httpu
        } else {
          const searchu = getSearchUrl(selectedEngine, u)
          setTabUrl(searchu)
          return searchu
        }
      } else {
        return u
      }
    })(tabUrl.trim())
    onSetTabUrl(url)
  }
  return (
    <div className="browser-bar">
      <div className="browser-tab-toolbar-navigation">
        <button 
          className="btn btn-default  hint--left"
          aria-label={ formatMessage({ id: 'browse-back' }) }
          disabled={ disableBack }
          onClick={ onGoBack }>
          <span className="ti-angle-left" />
        </button>
        <button
          className="btn btn-default  hint--left" 
          aria-label={ formatMessage({ id: 'browse-forward' }) }
          disabled={ disableForward }
          onClick={ onGoForward }>
          <span className="ti-angle-right" />
        </button>
        <button 
          className="btn btn-default  hint--left" 
          aria-label={ formatMessage({ id: 'browse-reload' }) }
          disabled={ disableReload }
          onClick={ onReload }>
          <span className="ti-reload" />
        </button>
      </div>
      <div className={ cx('browser-tab-toolbar-url', { edited }) }>
        <form onClick={ handleFormClick } onSubmit={ handleSubmit }>
          {edited ?
            <input 
              ref={ input }
              onKeyUp={ handleKeyUp }
              onBlur={ () => setEdited(false) } 
              onChange={ e => setTabUrl(e.target.value) }
              value={ tabUrl }
            />
            :
            isLanding ?
              <span className="toolbar-placeholder">You can directly write a URL address here</span>
              :
              <span className="browser-tab-url">
                {tabUrl}
                {/* <em>https</em>://<em>fr.wikipedia</em><em>.org</em><em>/wiki/La_Maison_des_feuilles</em> */}
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

BrowserBar.contextTypes = {
  intl: intlShape
}

BrowserBar.propTypes = {
  initialUrl: PropTypes.string.isRequired,
  selectedEngine: PropTypes.string.isRequired,
  displayAddButton: PropTypes.bool,
  isHomePage: PropTypes.bool,
  isLanding: PropTypes.bool,
  disableReload: PropTypes.bool,
  disableBack: PropTypes.bool,
  disableForward: PropTypes.bool,
  onReload: PropTypes.func,
  onGoBack: PropTypes.func,
  onGoForward: PropTypes.func,
  onSetTabUrl: PropTypes.func
}


export default BrowserBar