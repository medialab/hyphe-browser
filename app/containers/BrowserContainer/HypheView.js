import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

import BrowserView from 'react-electron-browser-view'

import Spinner from '../../components/Spinner'

const HypheView = ({
  url,
  isHypheView,
  onOpenTabFromHyphe
}) => {
  const [loading, setLoading] = useState(true)
  const webviewRef = useRef(null)

  useEffect(() => {
    const webview = webviewRef.current

    if (isHypheView && webview.getURL() === url) {
      webview.reload()
    }
  }, [isHypheView])

  const handleOpenWindow = (event, url) => {
    event.preventDefault()
    onOpenTabFromHyphe(url)
  }

  const handleFinishLoad = () => {
    const webview = webviewRef.current
    webview.insertCSS('.topbar-project button, .topbar-project .flex, #hybro-link, .no-hybro { display: none !important; }')
  }

  return (
    <div className="hyphe-view-container" style={ isHypheView ? {} : { display: 'none' } }>
      {loading &&
        <div className="spinner-container">
          <Spinner />
        </div>
      }
      <BrowserView
        src={ url }
        ref={ webviewRef }
        onDidStartLoading={ () => setLoading(true) }
        onDidStopLoading={ () => setLoading(false) }
        onDidFinishLoad={ handleFinishLoad }
        onNewWindow={ handleOpenWindow }
      />
    </div>
  )
}

HypheView.propTypes = {
  url: PropTypes.string.isRequired,
  isHypheView: PropTypes.bool.isRequired,
  onOpenTabFromHyphe: PropTypes.func.isRequired,
}

export default HypheView
