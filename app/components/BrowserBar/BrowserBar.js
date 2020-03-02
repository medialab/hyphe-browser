import './BrowserBar.styl'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

import cx from 'classnames'
import { isWebUri } from 'valid-url'
import { intlShape } from 'react-intl'

import { getSearchUrl } from '../../utils/search-web'

import { highlightUrlHTML } from '../../utils/lru'

const BrowserBar = function ({
  initialUrl,
  loading,
  tlds,
  lruPrefixes,
  selectedEngine,
  displayAddButton,
  isHomepage,
  isLanding,
  disableReload,
  disableBack,
  disableForward,
  onReload,
  onGoBack,
  onGoForward,
  onSetTabUrl,
  onSetHomepage,
  onAddClick
}, { intl }) {
  const { formatMessage } = intl

  const [edited, setEdited] = useState(isLanding ? true : false)
  const [tabUrl, setTabUrl] = useState(initialUrl)

  const input = useRef(null)

  useEffect(() => {
    if (initialUrl !== tabUrl) {
      setTabUrl(initialUrl)
    } 
  }, [initialUrl])

  // auto-focus input when new tab
  useEffect(() => {
    if (edited) {
      input.current.focus()
    }
  }, [edited])

  const handleFormClick = useCallback(() => {
    if (!edited) {
      setEdited(true)
      setTimeout(() => input.current.focus())
    }
  }, [edited])

  const handleKeyUp = useCallback((e) => {
    if (e.keyCode === 27) { // ESCAPE
      e.target.blur()
      setTabUrl(initialUrl)
    }
  }, [initialUrl])

  const handleSubmit = useCallback((e) => {
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
  }, [tabUrl])

  return (
    <div className="browser-bar">
      <div className="browser-tab-toolbar-navigation">
        <button 
          className="btn btn-default navigate-btn hint--left"
          aria-label={ formatMessage({ id: 'browse-back' }) }
          disabled={ disableBack }
          onClick={ onGoBack }>
          <span className="ti-angle-left" />
        </button>
        <button
          className="btn btn-default navigate-btn hint--left" 
          aria-label={ formatMessage({ id: 'browse-forward' }) }
          disabled={ disableForward }
          onClick={ onGoForward }>
          <span className="ti-angle-right" />
        </button>
        <button 
          className="btn btn-default navigate-btn hint--left" 
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
              placeholder={formatMessage({ id: 'empty-url' })}
              value={ tabUrl }
            />
            :
            lruPrefixes ?
              <span
                className= { cx('browser-tab-url', { loading }) }
                dangerouslySetInnerHTML={ {
                  __html: highlightUrlHTML(lruPrefixes, tabUrl, tlds)
                } }
              />:
              <span className={ cx('browser-tab-url empty', { loading }) }>
                {tabUrl || formatMessage({ id: 'empty-url' })}
              </span>
          }
        </form>
        {!loading && 
          <div className="page-actions">
            {
              !edited && displayAddButton
              &&
              <button onClick={ onAddClick } className="create-btn hint--left" aria-label={ formatMessage({ id: 'browse-create' }) }>
                <span className="ti-plus" />
              </button>
            }
            {
              !edited && !isLanding &&
              <button
                className={ cx('homepage-btn', 'hint--left', {
                  'is-active': isHomepage
                }) }
                aria-label={ isHomepage ? formatMessage({ id: 'is-homepage' }) : formatMessage({ id: 'set-homepage' }) }
                onClick={ onSetHomepage }
              >
                <span className="ti-layers-alt" />
              </button>
            }
          </div>
        }
      </div>
    </div>
  )
}

BrowserBar.contextTypes = {
  intl: intlShape
}

BrowserBar.propTypes = {
  initialUrl: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  tlds: PropTypes.object,
  lruPrefixes: PropTypes.arrayOf(PropTypes.string),
  selectedEngine: PropTypes.string.isRequired,
  displayAddButton: PropTypes.bool,
  isHomepage: PropTypes.bool,
  isLanding: PropTypes.bool,
  disableReload: PropTypes.bool,
  disableBack: PropTypes.bool,
  disableForward: PropTypes.bool,
  onReload: PropTypes.func,
  onGoBack: PropTypes.func,
  onGoForward: PropTypes.func,
  onSetTabUrl: PropTypes.func,
  onSetHomepage: PropTypes.func
}


export default BrowserBar