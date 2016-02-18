import '../../css/browser/stack'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T, FormattedRelative as D, intlShape } from 'react-intl'

import { emptyStack, fetchStack, viewWebentity } from '../../actions/stacks'
import { setTabUrl } from '../../actions/tabs'

class BrowserStack extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedStackName: this.props.selectedStack && this.props.selectedStack.name,
      selectedWebentityId: null
    }
  }

  // also called by refresh button
  fill () {
    const stack = this.props.stacks.find(s => s.name === this.state.selectedStackName)
    this.props.fetchStack(this.props.server.url, this.props.corpus, stack)
  }

  selectWebentity (weId) {
    const webentity = this.props.webentities.find(x => x.id === weId)
    this.setState({ selectedWebentityId: webentity.id })
    this.props.viewWebentity(webentity)
    this.props.setTabUrl(webentity.homepage, this.props.activeTabId)
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
    this.selectWebentity(webentity.id)
  }

  // top row
  renderFiller () {
    const { lastRefresh, selectedStack, stacks, webentities } = this.props
    const viewCount = webentities.filter(x => x.viewed).length

    if (!selectedStack) {
      return (
        <div className="browser-stack-filler toolbar-actions">
          <div className="browser-stack-selector">
            <select className="form-control"
              defaultValue={ this.state.selectedStackName }
              onChange={ (evt) => { if (evt.target.value) this.setState({ selectedStackName: evt.target.value }) } }>
              <option key="prompt" value="">{ this.context.intl.formatMessage({ id: 'select-stack' }) }</option>
              { stacks.map(s => (
                <option key={ s.name } value={ s.name }>{ s.description }</option>
              )) }
            </select>
            <button className="btn btn-default"
              onClick={ () => this.fill() }>
              <span className="icon icon-download"></span>
              <T id="fill" />
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="browser-stack-filler toolbar-actions">
        <div className="browser-stack-info">
          <div className="browser-stack-name">
            { selectedStack.name }
          </div>
          <div className="browser-stack-description">
            { selectedStack.description }
          </div>
        </div>
        <div className="browser-stack-views">
          <T id="viewed" /> { viewCount } / { webentities.length }
        </div>
        <div className="browser-stack-age">
          <span><T id="refreshed-ago" values={ { relative: <D value={ lastRefresh } /> } } /></span>
          <button className="btn btn-default"
              onClick={ () => this.fill() }>
            <span className="icon icon-arrows-ccw"></span>
            <T id="refresh" />
          </button>
        </div>
        <div>
          <button className="btn btn-default"
              onClick={ () => this.props.emptyStack() }>
            <span className="icon icon-trash"></span>
            <T id="empty" />
          </button>
        </div>
      </div>
    )
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
            <T id="previous" />
          </button>
        </div>
        <div className="browser-stack-wes-selector">
          <select className="form-control"
            value={ this.state.selectedWebentityId }
            onChange={ (evt) => this.selectWebentity(evt.target.value) }>
            { webentities.map((w, i) => (
              <option key={ w.id } value={ w.id }>#{ i + 1 } - { w.viewed ? `[${viewed}] - ` : '' } { w.name } ({ w.homepage })</option>
            )) }
          </select>
        </div>
        <div>
          <button className="btn btn-default browser-stack-wes-next"
            onClick={ () => this.rotateWebentity(1) }>
            <T id="next" />
            <span className="icon icon-right"></span>
          </button>
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className="browser-stack toolbar">
        { this.renderFiller() }
        { this.props.selectedStack ? this.renderWesSelector() : null }
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
  lastRefresh: PropTypes.number,
  server: PropTypes.object.isRequired,
  selectedStack: PropTypes.any,
  stacks: PropTypes.array.isRequired,
  webentities: PropTypes.array.isRequired,

  emptyStack: PropTypes.func.isRequired,
  fetchStack: PropTypes.func.isRequired,
  setTabUrl: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, servers, stacks, tabs }) => ({
  activeTabId: tabs.activeTab && tabs.activeTab.id,
  corpus: corpora.selected,
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
  viewWebentity
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowserStack)
