import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { intlShape } from 'react-intl'
import { ipcRenderer as ipc } from 'electron'
import cx from 'classnames'

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

      const { newTab, loading, url, openTab, closeTab, navigable, fixed } = this.props
      if (!newTab) {
        const menu = new Menu()
        if (!loading && url && navigable) {
          if (openTab) {
            menu.append(new MenuItem({ label: this.translate('menu.duplicate-tab'), click: this.duplicate }))
          }
          menu.append(new MenuItem({ label: this.translate('menu.open-in-browser'), click: this.openInBrowser }))
        }
        if (closeTab && !fixed) {
          menu.append(new MenuItem({ type: 'separator' }))
          menu.append(new MenuItem({ label: this.translate('menu.close-tab'), click: this.close }))
        }
        // Do not show empty menu
        if (menu.getItemCount() >= 1) {
          menu.popup(remote.getCurrentWindow())
        }
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

  translate (id) {
    return this.context.intl.formatMessage({ id })
  }

  render () {
    const { active, id, title, icon, loading, newTab, fixed } = this.props
    const cls = cx('browser-tab', 'tab-item', { active }, { 'tab-item-fixed': fixed })

    return (
      <div key={ id } className={ cls } onClick={ this.selectHandler }>
        { fixed
          ? null
          : <span className="icon icon-cancel-circled icon-close-tab" onClick={ this.closeHandler }></span>
        }
        { loading
          ? <span className="loading" />
          : (icon ? <img src={ icon } width="16" height="16" className="tab-favicon" /> : null)
        }
        { ' ' + (newTab ? this.translate('new-tab') : title) }
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
  fixed: PropTypes.bool,
  navigable: PropTypes.bool,
  newTab: PropTypes.bool,
  openTab: PropTypes.func,
  selectTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired
}

BrowserTab.contextTypes = {
  intl: intlShape
}

export default BrowserTab
