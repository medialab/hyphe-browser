// infinite webentities list

import React, { PropTypes } from 'react'
import Infinite from 'react-infinite'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'
import onClickOutside from 'react-onclickoutside'

class BrowserStackWesList extends React.Component {
  constructor (props) {
    super(props)

    this.state = { expanded: false }
  }

  handleClickOutside () {
    this.setState({ expanded: false })
  }

  renderWebListItem (w) {
    return (
      <div className={ cx('browser-stack-wes-list-item', { selected: this.props.selectedWebentityId === w.id }) }
        onClick={ () => this.props.selectWebentity(w) }>
        { w.viewed && <span className="we-viewed ti-check"></span> }
        <span className="we-name">{ w.name }</span>
        <span className="we-indegree">{ w.indegree }</span>
      </div>
    )
  }

  renderToggle () {
    return <span className={ cx('browser-stack-toggle', 'ti-exchange-vertical', { expanded: this.state.expanded }) }
             onClick={ () => this.setState({ expanded: !this.state.expanded }) }></span>
  }

  render () {
    const { selectedStack, webentities, selectedWebentityId } = this.props

    if (!selectedStack) {
      return <div className="browser-stack-wes-empty-list"><T id="select-stack" /></div>
    }

    if (!this.state.expanded && selectedWebentityId) {
      const webentity = webentities.find(it => it.id === selectedWebentityId)
      return (
        <div className="browser-stack-wes-list">
          { this.renderWebListItem(webentity) }
          { this.renderToggle() }
        </div>
      )
    }

    return (
      <div className="browser-stack-wes-list expanded">
        <Infinite className="browser-stack-wes-infinite" containerHeight={ 350 } elementHeight={ 35 }>
          { webentities.map(w => this.renderWebListItem(w)) }
        </Infinite>
        { this.renderToggle() }
      </div>
    )
  }
}

BrowserStackWesList.contextTypes = {
  intl: intlShape
}

BrowserStackWesList.propTypes = {
  selectedStack: PropTypes.any,
  selectedWebentityId: PropTypes.any,
  webentities: PropTypes.array,

  selectWebentity: PropTypes.func
}

export default onClickOutside(BrowserStackWesList)
