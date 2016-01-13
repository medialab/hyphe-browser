import React, { PropTypes } from 'react'
import WebView from './WebView'
import Button from './Button'

class TabContent extends React.Component {

  constructor (props) {
    super(props)
    this.navigationActions = {} // Mutated by WebView
  }

  render () {
    const { onTabStatusUpdate, active, id, url } = this.props

    return (
      <div key={ id } className="browser-tab-content" style={ active ? {} : { display: 'none' } }>
        <div className="toolbar-actions">
          <Button size="large" icon="left-open" onClick={ () => this.navigationActions.back() } />
          <Button size="large" icon="right-open" onClick={ () => this.navigationActions.forward() } />
          <Button size="large" icon="ccw" onClick={ () => this.navigationActions.reload() } />
        </div>
        <WebView id={ id } url={ url } onStatusUpdate={ onTabStatusUpdate }
          onNavigationActionsReady={ (actions) => Object.assign(this.navigationActions, actions) } />
      </div>
    )
  }
}

TabContent.propTypes = {
  onTabStatusUpdate: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
}

export default TabContent
