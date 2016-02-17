import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { intlShape } from 'react-intl'
import { ipcRenderer as ipc } from 'electron'

import remote from 'remote'

const Menu = remote.require('menu')
const MenuItem = remote.require('menu-item')

class BrowserTab extends React.Component {
  constructor (props) {
    super(props)

    this.close = this.close.bind(this)
    this.closeHandler = this.closeHandler.bind(this)
    this.selectHandler = this.selectHandler.bind(this)
    this.openInBrowser = this.openInBrowser.bind(this)
    this.duplicate = this.duplicate.bind(this)
  }

  componentDidMount () {
    const el = findDOMNode(this)
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault()

      const { newTab, loading, url } = this.props
      if (!newTab) {
        const menu = new Menu()
        if (!loading && url) {
          if (this.props.openTab) {
            menu.append(new MenuItem({ label: 'Duplicate tab', click: this.duplicate }))
          }
          menu.append(new MenuItem({ label: 'Open in default browser', click: this.openInBrowser }))
        }
        if (this.props.closeTab) {
          menu.append(new MenuItem({ type: 'separator' }))
          menu.append(new MenuItem({ label: 'Close tab', click: this.close }))
        }
        menu.popup(remote.getCurrentWindow())
      }
    })
  }

  openInBrowser () {
    ipc.send('openExternal', this.props.url)
  }

  duplicate () {
    this.props.openTab(this.props.url)
  }

  close () {
    this.props.closeTab(this.props.id)
  }

  closeHandler (e) {
    e.preventDefault()
    this.close()
  }

  selectHandler (e) {
    e.preventDefault()
    this.props.selectTab(this.props.id)
  }

  render () {
    const { active, id, title, icon, loading, newTab } = this.props

    return (
      <div key={ id } className={ 'browser-tab tab-item ' + (active ? ' active' : '') } onClick={ this.selectHandler }>
        <span className="icon icon-cancel-circled icon-close-tab" onClick={ this.closeHandler }></span>
        { loading
          ? <span className="loading" />
          : (icon ? <img src={ icon } width="16" height="16" className="tab-favicon" /> : null)
        }
        { ' ' + (newTab ? this.context.intl.formatMessage({ id: 'new-tab' }) : title) }
      </div>
    )
  }
}

BrowserTab.propTypes = {
  id: PropTypes.string.isRequired,
  active: PropTypes.bool,
  title: PropTypes.string,
  url: PropTypes.string,
  icon: PropTypes.string,
  loading: PropTypes.bool,
  newTab: PropTypes.bool,
  openTab: PropTypes.func,
  selectTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired
}

BrowserTab.contextTypes = {
  intl: intlShape
}

export default BrowserTab
