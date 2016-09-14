import '../../css/browser/browser-tab'

import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { intlShape } from 'react-intl'
import { remote, ipcRenderer as ipc } from 'electron'
import cx from 'classnames'
import { HYPHE_TAB_ID } from '../../constants'

const { Menu, MenuItem } = remote

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
    const { active, id, title, icon, loading, newTab, fixed, closable } = this.props
    const cls = cx('browser-tab-item', { active }, {
      'browser-tab-item-fixed': fixed,
      'browser-tab-item-hyphe': id === HYPHE_TAB_ID,
    })

    return (
      <div key={ id } className={ cls } onClick={ this.selectHandler }>
        { loading
          ? <span className="loading" />
          : (icon ? <img src={ icon } width="16" height="16" className="browser-tab-favicon" /> : null)
        }
        <span className="browser-tab-title">{ ' ' + (newTab ? this.translate('new-tab') : title) }</span>
        { !fixed && closable && <span className="ti-close" onClick={ this.closeHandler }></span> }
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
  // tab not closable when is the last one
  closable: PropTypes.bool,
  navigable: PropTypes.bool,
  newTab: PropTypes.bool,
  openTab: PropTypes.func,
  selectTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
}

BrowserTab.contextTypes = {
  intl: intlShape
}

export default BrowserTab
