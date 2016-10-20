// small upper part of tabs (favicon, close button…)

import '../../css/browser/browser-tab-label'

import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { intlShape } from 'react-intl'
import { remote, ipcRenderer as ipc } from 'electron'
import cx from 'classnames'
import { HYPHE_TAB_ID } from '../../constants'

const { Menu, MenuItem } = remote

class BrowserTabLabel extends React.Component {
  constructor (props) {
    super(props)

    this.close = this.close.bind(this)
    this.closeHandler = this.closeHandler.bind(this)
    this.selectHandler = this.selectHandler.bind(this)
    this.openInBrowser = this.openInBrowser.bind(this)
    this.duplicate = this.duplicate.bind(this)
  }

  translate (id) {
    return this.context.intl.formatMessage({ id })
  }

  componentDidMount () {
    const el = findDOMNode(this)
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault()

      const { newTab, loading, url, openTab, closeTab, navigable, fixed, closable } = this.props
      const menu = new Menu()
      if (!newTab && !loading && url && navigable) {
        if (openTab) {
          menu.append(new MenuItem({ label: this.translate('menu.duplicate-tab'), click: this.duplicate }))
        }
        menu.append(new MenuItem({ label: this.translate('menu.open-in-browser'), click: this.openInBrowser }))
      }
      if (closable && closeTab && !fixed) {
        if (menu.getItemCount() >= 1) menu.append(new MenuItem({ type: 'separator' }))
        menu.append(new MenuItem({ label: this.translate('menu.close-tab'), click: this.close }))
      }
      // Do not show empty menu
      if (menu.getItemCount() >= 1) {
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
    // do not trigger a selectTab just after
    e.stopPropagation()
    this.close()
  }

  selectHandler (e) {
    e.preventDefault()
    this.props.selectTab(this.props.id)
  }

  render () {
    const { formatMessage } = this.context.intl
    const { active, id, title, webentity, icon, loading, newTab, fixed, closable } = this.props
    const cls = cx('browser-tab-label', { active }, {
      'browser-tab-label-fixed': fixed,
      'browser-tab-label-hyphe': id === HYPHE_TAB_ID,
    })
    const label = newTab
      ? formatMessage({ id: 'new-tab'})
      : id === HYPHE_TAB_ID 
        ? 'H'
        : webentity && webentity.name
          ? webentity.name
          : title

    // use of <object> explained here: http://stackoverflow.com/questions/22051573/how-to-hide-image-broken-icon-using-only-css-html-without-js
    // because medialab return a 200 with no favicon :s
    return (
      <div key={ id } className={ cls } onClick={ this.selectHandler } title={ title }>
        { loading
          ? <span className="loading" />
          : (icon && <object data={ icon } width="16" height="16" className="browser-tab-favicon"></object>)
        }
        <span className="browser-tab-title">{ label }</span>
        { !fixed && closable && <span className="ti-close" onClick={ this.closeHandler }></span> }
      </div>
    )
  }
}

BrowserTabLabel.propTypes = {
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

BrowserTabLabel.contextTypes = {
  intl: intlShape
}

export default BrowserTabLabel
