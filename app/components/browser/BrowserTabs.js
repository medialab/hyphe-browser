import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import cx from 'classnames'

import Tab from './BrowserTab'
import TabContent from './BrowserTabContent'

import { connect } from 'react-redux'
import { openTab, closeTab, selectTab } from '../../actions/tabs'

class BrowserTabs extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      overflow: false,
      scroll: 0,
      maxScroll: 0
    }

    // Bound as one method to make removeEventListener work properly
    this.onResize = () => this.updateTabsOverflow()
  }

  componentDidMount () {
    const node = findDOMNode(this)
    this.tabsNode = node.querySelector('.tab-group-main')
    // Listen for resize
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount () {
    // Clear event listeners
    window.removeEventListener('resize', this.onResize)
  }

  componentDidUpdate () {
    this.updateTabsOverflow()
  }

  renderTabContents () {
    return this.props.tabs.map((tab) => (
      <TabContent key={ tab.id } id={ tab.id } />
    ))
  }

  renderTabs () {
    return this.props.tabs.map((tab) => (
      <Tab { ...tab } key={ tab.id }  active={ this.props.activeTab === tab.id }
        selectTab={ this.props.selectTab } closeTab={ this.props.closeTab } />
    ))
  }

  updateTabsOverflow () {
    const style = getComputedStyle(this.tabsNode)
    const tabsNodeVisibleWidth = this.tabsNode.clientWidth - parseInt(style['padding-left']) - parseInt(style['padding-right'])
    const maxScroll = this.tabsNode.scrollWidth - tabsNodeVisibleWidth
    const overflow = (maxScroll > 0)
    if (this.state.overflow !== overflow) {
      // Overflow modified: reset scroll
      this.setState({ overflow, maxScroll, scroll: 0 })
    } else if (this.state.maxScroll !== maxScroll) {
      // Only scroll max size has changed: shrink current scroll is necessary
      this.setState({ maxScroll, scroll: Math.min(this.state.scroll, maxScroll) })
    }
  }

  scrollTabs (offset) { // +1 = scroll right, -1 = scroll left
    if (!this.state.overflow) {
      return // disabled
    }

    const oneTabWidth = this.tabsNode.querySelector('.tab-item').clientWidth
    const scroll = Math.min(this.state.maxScroll, Math.max(0, this.state.scroll + offset * oneTabWidth))
    if (this.state.scroll !== scroll) {
      this.setState({ scroll })
    }
  }

  render () {
    const tabGroupStyle = this.state.scroll === null ? {} : {
      marginLeft: '-' + this.state.scroll + 'px',
      paddingRight: this.state.scroll + 'px'
    }

    return (
      <div className={ cx('browser-navigator', { 'tab-overflow': this.state.overflow }) }>
        <div className="tab-group">
          <div className="tab-group tab-group-specials-left">
            <div className={ cx('browser-tab-scroll-left', 'tab-item', 'tab-item-fixed', { 'inactive': !this.state.overflow || this.state.scroll <= 0 }) }
              onClick={ () => this.scrollTabs(-1) }>
              <span className="icon icon-left-dir"></span>
            </div>
          </div>
          <div className="tab-group tab-group-main" style={ tabGroupStyle }>
            { this.renderTabs() }
          </div>
          <div className="tab-group tab-group-specials-right">
            <div className={ cx('browser-tab-scroll-right', 'tab-item', 'tab-item-fixed', { 'inactive': !this.state.overflow || this.state.scroll >= this.state.maxScroll }) }
              onClick={ () => this.scrollTabs(+1) }>
              <span className="icon icon-right-dir"></span>
            </div>
            <div className="browser-tab-new tab-item tab-item-fixed" onClick={ () => this.props.openTab('http://google.fr') }>
              <span className="icon icon-plus"></span>
            </div>
            <div className="browser-tab-hyphe tab-item tab-item-fixed">
              TODO Hyphe special tab
            </div>
          </div>
        </div>
        { this.renderTabContents() }
      </div>
    )
  }
}

BrowserTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.object
  })).isRequired,
  activeTab: PropTypes.string,

  openTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
  selectTab: PropTypes.func.isRequired
}

const mapStateToProps = ({ tabs }) => tabs //  { tabs, activeTab }

const mapDispatchToProps = { openTab, closeTab, selectTab }

export default connect(mapStateToProps, mapDispatchToProps)(BrowserTabs)
