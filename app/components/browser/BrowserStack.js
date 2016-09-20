// upper part with stack list on the left and stack fillers on the right

import '../../css/browser/browser-stack'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { intlShape } from 'react-intl'
import cx from 'classnames'

import { emptyStack, fetchStack, viewWebentity } from '../../actions/stacks'
import { setTabUrl, openTab } from '../../actions/tabs'
import { HYPHE_TAB_ID } from '../../constants'
import BrowserStackWesList from './BrowserStackWesList'

class BrowserStack extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedStackName: this.props.selectedStack && this.props.selectedStack.name,
      selectedWebentityId: null
    }
  }

  // auto display first webentity in newly filled stack
  componentWillReceiveProps (props) {
    if ((!this.props.selectedStack && props.selectedStack && props.webentities.length)
        || this.props.lastRefresh !== props.lastRefresh) {
      this.selectWebentity(props.webentities[0])
    }
  }

  // also called by refresh button
  fill (stackName) {
    stackName = stackName || this.state.selectedStackName
    const stack = this.props.stacks.find(s => s.name === stackName)
    this.props.fetchStack(this.props.server.url, this.props.corpus, stack)
  }

  selectWebentity (webentity) {
    this.setState({ selectedWebentityId: webentity.id })
    this.props.viewWebentity(webentity)
    if (this.props.activeTabId && this.props.activeTabId !== HYPHE_TAB_ID) {
      this.props.setTabUrl(webentity.homepage, this.props.activeTabId)
    } else {
      this.props.openTab(webentity.homepage)
    }
  }

  // used by Prev (-1) / Next (+1) buttons
  rotateWebentity (offset) {
    const { webentities } = this.props
    const idx = webentities.findIndex(x => x.id === this.state.selectedWebentityId)
    let webentity
    if (idx === 0 && offset === -1) {
      webentity = webentities[webentities.length - 1]
    } else if (idx === webentities.length - 1 && offset === 1) {
      webentity = webentities[0]
    } else {
      webentity = webentities[idx + offset]
    }
    this.selectWebentity(webentity)
  }

  // right side, colored buttons to fill stack
  renderStackFillers () {
    const { formatMessage } = this.context.intl
    const { status, stacks, selectedStack } = this.props
    const ready = status && status.corpus && status.corpus.ready
    if (!ready) return null

    const counters = status.corpus.memory_structure.webentities

    return (
      <span className="fillers">
        { stacks.map((stack) =>
          <button key={ stack.name }
            className={ cx('filler', `filler-${stack.name.replace(/\s/g, '_')}`,
              {'selected': stack.name === (selectedStack && selectedStack.name) }) }
            disabled={ !counters[stack.name] }
            onClick={ () => { this.setState({ selectedStackName: stack.name }); this.fill(stack.name) } }>
            <div className="filler-name">{ formatMessage({ id: 'corpus-status.' + stack.name }) }</div>
            <div className="filler-counter">{ counters[stack.name] || 0 }</div>
          </button>
        ) }
      </span>
    )
  }

  renderProgress () {
    const { webentities, selectedStack } = this.props
    if (!selectedStack) return
    const viewCount = webentities.filter(x => x.viewed).length

    return <progress value={ viewCount } max={ webentities.length } />
  }

  // left side
  renderWesSelector () {
    const { selectedStack, webentities } = this.props

    return (
      <div className="browser-stack-wes">
        <button className="btn btn-default"
          disabled={ !selectedStack }
          onClick={ () => this.rotateWebentity(-1) }>
          <span className="ti-arrow-circle-left"></span>
        </button>
        <div className="browser-stack-wes-selector">
          <BrowserStackWesList selectedStack={ selectedStack } webentities={ webentities }
            selectedWebentityId={ this.state.selectedWebentityId }
            selectWebentity={ (w) => this.selectWebentity(w) }/>
          { this.renderProgress() }
        </div>
        <button className="btn btn-default"
          disabled={ !selectedStack }
          onClick={ () => this.rotateWebentity(1) }>
          <span className="ti-arrow-circle-right"></span>
        </button>
        <button className="btn btn-default"
          disabled={ !selectedStack }
          onClick={ () => this.fill() }>
          <span className="ti-loop"></span>
        </button>
      </div>
    )
  }

  render () {
    return (
      <div className="browser-stack">
        { this.renderWesSelector() }
        { this.renderStackFillers() }
      </div>
    )
  }
}

BrowserStack.contextTypes = {
  intl: intlShape
}

BrowserStack.propTypes = {
  activeTabId: PropTypes.string,
  corpus: PropTypes.object.isRequired,
  status: PropTypes.object.isRequired,
  lastRefresh: PropTypes.number,
  server: PropTypes.object.isRequired,
  selectedStack: PropTypes.any,
  stacks: PropTypes.array.isRequired,
  webentities: PropTypes.array.isRequired,

  emptyStack: PropTypes.func.isRequired,
  fetchStack: PropTypes.func.isRequired,
  setTabUrl: PropTypes.func.isRequired,
  openTab: PropTypes.func.isRequired,
  viewWebentity: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, servers, stacks, tabs }) => ({
  activeTabId: tabs.activeTab && tabs.activeTab.id,
  corpus: corpora.selected,
  status: corpora.status,
  lastRefresh: stacks.lastRefresh,
  server: servers.selected,
  selectedStack: stacks.selected,
  stacks: stacks.list,
  webentities: stacks.webentities
})

const mapDispatchToProps = {
  emptyStack,
  fetchStack,
  setTabUrl,
  openTab,
  viewWebentity
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowserStack)
