import React from 'react'
import PropTypes from 'prop-types'

import Spinner from '../../components/Spinner'

class HypheView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isLoading: true
    }
  }

  componentDidMount () {
    const webview = document.querySelector('webview')
    this.node = webview

    webview.addEventListener('did-start-loading', this.loadStart)
    webview.addEventListener('did-stop-loading', () => {
      this.loadStop()
      webview.executeJavaScript(
        // Stop Sigma's ForceAtlas2 in Hyphe tab when changing tab to avoid cpu overhaul
        "window.onblur = function() { if (document.querySelector('#stopFA2') !== undefined) document.querySelector('#stopFA2').click() }; " +
        // Remove leave corpus button from Hyphe tab within HyBro
        "document.querySelector('.topbar-project button').remove(); " +
        "document.querySelector('.topbar-project .flex').remove(); " +
        "document.querySelector('#hybro-link').remove();"
      )
    })

    webview.addEventListener('new-window', ({ url }) => {
      this.props.onOpenTabFromHyphe(url)
    })
  }

  componentDidUpdate (prevProps) {
    // reload when is network view
    if (this.props.isHypheView !== prevProps.isHypheView &&
        this.props.isHypheView && 
        this.node.src === this.props.url ) {
      this.node.reload()
    }
  }

  loadStart = () => {
    this.setState({
      isLoading: true
    })
  }

  loadStop = () => {
    this.setState({
      isLoading: false
    })
  }
  
  render () {
    const { isLoading } = this.state
    return (
      <div className="hyphe-view-container" style={ this.props.style }>
        {isLoading &&
          <div className="spinner-container">
            <Spinner /> 
          </div>
        }
        <webview
          src={ this.props.url }
        />
      </div>
    )
  }
}

HypheView.propTypes = {
  url: PropTypes.string.isRequired,
  isHypheView: PropTypes.bool.isRequired,
  onOpenTabFromHyphe: PropTypes.func.isRequired,
}


export default HypheView
