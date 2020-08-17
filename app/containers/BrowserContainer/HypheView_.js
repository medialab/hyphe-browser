import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import once from 'lodash/once'

import { DEBUG_WEBVIEW } from '../../constants'
import Spinner from '../../components/Spinner'

const HypheView = ({
  url,
  style,
  isHypheView,
  onOpenTabFromHyphe
}) => {
  const [loading, setLoading] = useState(true)
  const webviewRef = useRef(null)

  useEffect(() => {
    const webview = webviewRef.current

    const inejectStyle = once(() => {
      webview.executeJavaScript(`
        const style = document.createElement('style');
        style.textContent = ".topbar-project button, .topbar-project .flex, #hybro-link, .no-hybro { display: none !important; }";
        document.head.append(style);
        console.log(style);
      `)
    })

    webview.addEventListener('did-start-loading', () => {
      setLoading(true)
    })
    webview.addEventListener('did-stop-loading', () => {
      setLoading(false)
      inejectStyle()

      webview.executeJavaScript(
        // Stop Sigma's ForceAtlas2 in Hyphe tab when changing tab to avoid cpu overhaul
        "window.onblur = function() { if (document.querySelector('#stopFA2') !== undefined) document.querySelector('#stopFA2').click() }; "
      )
    })

    webview.addEventListener('new-window', ({ url }) => {
      if (!onOpenTabFromHyphe(url)) {
        webview.executeJavaScript(
          `window.history.pushState({}, 'Hyphe', '${url}')`
        )
      }
    })

    if (DEBUG_WEBVIEW) {
      webview.addEventListener('console-message', (e) => {
        console.log('[HypheView console]', e.message) // eslint-disable-line no-console
      })
    }
  
  }, [])
  
  // reload hyphe if is network page
  useEffect(() => {
    const webview = webviewRef.current

    if (isHypheView && webview.src === url) {
      webview.reload()
    }
  }, [isHypheView])

  return (
    <div className="hyphe-view-container" style={ style }>
      {loading &&
        <div className="spinner-container">
          <Spinner />
        </div>
      }
      <webview
        ref={ webviewRef }
        src={ url }
      />
    </div>
  )
}

HypheView.propTypes = {
  url: PropTypes.string.isRequired,
  style: PropTypes.object,
  isHypheView: PropTypes.bool.isRequired,
  onOpenTabFromHyphe: PropTypes.func.isRequired,
}

export default HypheView
