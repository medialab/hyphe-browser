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

    webview.addEventListener('did-start-loading', this.loadStart)
    webview.addEventListener('did-stop-loading', this.loadStop)

    webview.addEventListener('new-window', ({ url }) => {
      this.props.onOpenTabFromHyphe(url)
    })
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
      <div className="hyphe-view-container">
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
  onOpenTabFromHyphe: PropTypes.func.isRequired,
}


export default HypheView