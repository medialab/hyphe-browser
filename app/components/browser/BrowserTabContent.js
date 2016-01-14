import React, { PropTypes } from 'react'
import WebView from './WebView'
import Button from './Button'

import { connect } from 'react-redux'
import { showError } from '../../actions/browser'
import { setTabUrl, setTabStatus, setTabTitle, setTabIcon } from '../../actions/tabs'

import networkErrors from '@naholyr/chromium-net-errors'

class TabContent extends React.Component {

  constructor (props) {
    super(props)
    this.navigationActions = {} // Mutated by WebView
  }

  updateTabStatus (event, info) {
    switch (event) {
    case 'start':
      this.props.setTabStatus({ loading: true, url: info }, this.props.id)
      break
    case 'stop':
      this.props.setTabStatus({ loading: false, url: info }, this.props.id)
      break
    case 'title':
      this.props.setTabTitle(info, this.props.id)
      break
    case 'favicon':
      this.props.setTabIcon(info, this.props.id)
      break
    case 'error':
      const err = networkErrors.createByCode(info.errorCode)
      if (info.pageURL === info.validatedURL) {
        // Main page triggered the error, it's important
        this.props.showError({ message: err.message, fatal: false, icon: 'attention', timeout: 10000 })
        this.props.setTabStatus({ loading: false, url: info.pageURL, error: info }, this.props.id)
      }
      // Anyway, log to console
      console.error(err) // eslint-disable-line no-console
      break
    default:
      break
    }
  }

  render () {
    const { onTabStatusUpdate, active, id, url } = this.props

    return (
      <div key={ id } className="browser-tab-content" style={ active ? {} : { display: 'none' } }>
        <div className="toolbar toolbar-header">
          <div className="toolbar-actions">
            <div className="btn-group tab-toolbar-navigation">
              <Button size="large" icon="left-open" onClick={ () => this.navigationActions.back() } />
              <Button size="large" icon="right-open" onClick={ () => this.navigationActions.forward() } />
              <Button size="large" icon="ccw" onClick={ () => this.navigationActions.reload() } />
            </div>
            <div className="btn-group tab-toolbar-url">
              <input className="btn btn-large" type="text" value={ url } />
            </div>
            <div className="btn-group tab-toolbar-webentity">
              <Button size="large" icon="home" onClick={ () => this.navigationActions.back() } />
              <input className="btn btn-large" type="text" value={ 'WEBENTITY NAME' } />
              <Button size="large" icon="pencil" onClick={ () => this.navigationActions.reload() } />
            </div>
          </div>
        </div>
        <WebView id={ id } url={ url }
          onStatusUpdate={ (e, i) => this.updateTabStatus(e, i) }
          onNavigationActionsReady={ (actions) => Object.assign(this.navigationActions, actions) } />
      </div>
    )
  }
}

TabContent.propTypes = {
  active: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,

  showError: PropTypes.func.isRequired,
  setTabUrl: PropTypes.func.isRequired,
  setTabStatus: PropTypes.func.isRequired,
  setTabTitle: PropTypes.func.isRequired,
  setTabIcon: PropTypes.func.isRequired
}

const mapStateToProps = null

const mapDispatchToProps = { showError, setTabUrl, setTabStatus, setTabTitle, setTabIcon }

export default connect(mapStateToProps, mapDispatchToProps)(TabContent)
