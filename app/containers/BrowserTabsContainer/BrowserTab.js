// small upper part of tabs (favicon, close button…)
import './BrowserTab.styl'

import React from 'react'
import PropTypes from 'prop-types'

import { findDOMNode } from 'react-dom'
import { injectIntl } from 'react-intl'
import { remote, ipcRenderer as ipc } from 'electron'
import cx from 'classnames'

const { Menu, MenuItem } = remote

class BrowserTab extends React.Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {
    const { formatMessage } = this.props.intl
    const el = findDOMNode(this)

    const translate = (id) => {
      return formatMessage({ id })
    }

    const openInBrowser = () => {
      ipc.send('openExternal', this.props.url)
    }

    const duplicate = () => {
      this.props.openTab({ url: this.props.url, activeTabId: this.props.id })
    }

    const close = () => {
      this.props.closeTab(this.props.id)
    }

    el.addEventListener('contextmenu', (e) => {
      e.preventDefault()

      const { newTab, loading, url, openTab, closeTab, navigable, fixed, closable } = this.props
      const menu = new Menu()
      if (!newTab && !loading && url && navigable) {
        if (openTab) {
          menu.append(new MenuItem({ label: translate('menu.duplicate-tab'), click: duplicate }))
        }
        menu.append(new MenuItem({ label: translate('menu.open-in-browser'), click: openInBrowser }))
      }
      if (closable && closeTab && !fixed) {
        if (menu.getItemCount() >= 1) menu.append(new MenuItem({ type: 'separator' }))
        menu.append(new MenuItem({ label: translate('menu.close-tab'), click: close }))
      }
      // Do not show empty menu
      if (menu.getItemCount() >= 1) {
        menu.popup(remote.getCurrentWindow())
      }
    })
  }

  render () {
    const { formatMessage } = this.props.intl
    const { active, id, title, webentity, icon, loading, newTab, fixed, closable } = this.props
    const cls = cx('browser-tab-label', { active }, {
      'browser-tab-label-fixed': fixed,
    })
    const label = newTab
      ? formatMessage({ id: 'new-tab' })
      : webentity && webentity.name
        ? webentity.name
        : title

    const closeHandler = (e) => {
      e.preventDefault()
      // do not trigger a selectTab just after
      e.stopPropagation()
      this.props.closeTab(this.props.id)
    }

    const selectHandler = (e) => {
      e.preventDefault()
      this.props.selectTab(this.props.id)
    }
    // use of <object> explained here: http://stackoverflow.com/questions/22051573/how-to-hide-image-broken-icon-using-only-css-html-without-js
    // because medialab return a 200 with no favicon :s
    return (
      <div key={ id } className={ cls } onClick={ selectHandler }>
        { loading
          ? <span className="loading" />
          : (icon && <object data={ icon } width="16" height="16" className="browser-tab-favicon" />)
        }
        <span className={ title && 'hint--right' } aria-label={ title }>
          <span className="browser-tab-title">{ label }</span>
        </span>
        { !fixed && closable && <span className="ti-close" onClick={ closeHandler } /> }
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
  webentity: PropTypes.object,
  loading: PropTypes.bool,
  fixed: PropTypes.bool,
  // tab not closable when is the last one
  closable: PropTypes.bool,
  navigable: PropTypes.bool,

  // actions
  newTab: PropTypes.bool,
  openTab: PropTypes.func,
  selectTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
}

export default injectIntl(BrowserTab)
