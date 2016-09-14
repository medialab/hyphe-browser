import '../../css/browser/browser-stack'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T, FormattedRelative as D, intlShape } from 'react-intl'
import cx from 'classnames'

import { emptyStack, fetchStack, viewWebentity } from '../../actions/stacks'
import { setTabUrl, openTab } from '../../actions/tabs'
import { HYPHE_TAB_ID } from '../../constants'

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
    if (!this.props.selectedStack && props.selectedStack && props.webentities.length) {
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
  renderStackButtons () {
    const { status, stacks, selectedStack } = this.props
    const ready = status && status.corpus && status.corpus.ready
    if (!ready) return null

    const { formatMessage } = this.context.intl
    const counters = status.corpus.memory_structure.webentities

    return (
      <span className="fillers">
        { stacks.map((stack) =>
          <button key={ stack.name }
            className={ cx('filler', `filler-${stack.name}`,
              {'selected': stack.name === (selectedStack && selectedStack.name) }) }
            onClick={ () => { this.setState({ selectedStackName: stack.name }); this.fill(stack.name) } }>
            <div className="filler-name">{ stack.name }</div>
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

  // bottom row
  renderWesSelector () {
    const { webentities } = this.props
    const viewed = this.context.intl.formatMessage({ id: 'viewed' })

    return (
      <div className="browser-stack-wes toolbar-actions">
        <div>
          <button className="btn btn-default browser-stack-wes-prev"
            onClick={ () => this.rotateWebentity(-1) }>
            <span className="icon icon-left"></span>
          </button>
        </div>
        <div className="browser-stack-wes-selector">
          <select className="form-control"
            value={ this.state.selectedWebentityId }
            onChange={ (evt) => this.selectWebentity(webentities.find(x => x.id === evt.target.value)) }>
            { webentities.map((w, i) => (
              <option key={ w.id } value={ w.id }>#{ i + 1 } - { w.viewed ? `[${viewed}] - ` : '' } { w.name } ({ w.homepage })</option>
            )) }
          </select>
        </div>
        <div>
          <button className="btn btn-default browser-stack-wes-next"
            onClick={ () => this.rotateWebentity(1) }>
            <span className="icon icon-right"></span>
          </button>
        </div>
        <div className="browser-stack-age">
          <button className="btn btn-default"
              onClick={ () => this.fill() }>
            <span className="icon icon-arrows-ccw"></span>
          </button>
        </div>
        { this.renderProgress() }
      </div>
    )
  }

  render () {
    return (
      <div className="browser-stack">
        { this.props.selectedStack ? this.renderWesSelector() : null }
        { this.renderStackButtons() }
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
