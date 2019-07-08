// upper part with stack list on the left and stack fillers on the right

import './browser-stack'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { intlShape } from 'react-intl'
import cx from 'classnames'

import { emptyStack, fetchStack, viewWebentity, loadingWebentity } from '../../actions/stacks'
import { setTabUrl, openTab } from '../../actions/tabs'
import { HYPHE_TAB_ID } from '../../constants'
import BrowserStackWesList from './BrowserStackWesList'

class BrowserStack extends React.Component {
  // auto display first webentity in newly filled stack
  componentWillReceiveProps (props) {
    if ((!this.props.selectedStack && props.selectedStack && props.webentities.length)
        || this.props.lastRefresh !== props.lastRefresh) {
      this.selectWebentity(props.webentities[0])
    }
  }

  selectWebentity = (webentity) => {
    this.props.loadingWebentity()
    this.props.viewWebentity(webentity)
    if (this.props.activeTabId && this.props.activeTabId !== HYPHE_TAB_ID) {
      this.props.setTabUrl(webentity.homepage, this.props.activeTabId)
    } else {
      this.props.openTab(webentity.homepage)
    }
  }

  // used by Prev (-1) / Next (+1) buttons
  rotateWebentity = (offset) => {
    const { webentities } = this.props
    const idx = webentities.findIndex(x => x.id === this.props.selectedWebentity.id)
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
    const { server, corpus, status, stacks, selectedStack, loadingWebentityStack, loading, fetchStack } = this.props
    const ready = status && status.corpus && status.corpus.ready
    if (!ready) return null

    const counters = status.corpus.traph.webentities

    // do not display this stack button if empty
    const usefulStacks = stacks.filter(s => s.name !== 'IN_UNCRAWLED' || counters[s.name])
    
    return (
      <span className="fillers">
        { usefulStacks.map((stack) => { 
          const disabled = !counters[stack.name] || loadingWebentityStack || loading
          const fillStack = () => fetchStack(server.url, corpus.corpus_id, stack)
  
          return (
            <button
              key={ stack.name }
              className={ cx('filler', `filler-${stack.name.replace(/\s/g, '_')}`,
                { 'selected': stack.name === (selectedStack && selectedStack.name) }) }
              disabled={ disabled }
              onClick={ fillStack }
            >
              <div className="filler-name hint--bottom" aria-label={ !disabled ? ( stack.name === 'DISCOVERED' ? formatMessage({ id: 'fill-discovered' }) : formatMessage({ id: 'fill' }) + formatMessage({ id: 'corpus-status.' + stack.name })) : '' }>
                { formatMessage({ id: 'corpus-status.' + stack.name }) }
              </div>
              <div className="filler-counter">
                { counters[stack.name] || 0 }
              </div>
            </button>
          )}
        ) }
      </span>
    )
  }

  renderProgress () {
    const { webentities, selectedStack, loading } = this.props
    const viewCount = webentities.filter(x => x.viewed).length

    return <progress className="hint--right" aria-label={ loading || !selectedStack ? '' : `${viewCount} / ${webentities.length}` } value={ loading ? 0 : viewCount } max={ webentities.length } />
  }

  // left side
  renderWesSelector () {
    const { formatMessage } = this.context.intl
    const { selectedStack, selectedWebentity, webentities, loading, loadingWebentityStack } = this.props

    // disable next / prev
    const isFirst = webentities.length && selectedWebentity &&
      selectedWebentity.id === webentities[0].id
    const isLast = webentities.length && selectedWebentity &&
      selectedWebentity.id === webentities[webentities.length - 1].id
    const goNextWebentity = () => this.rotateWebentity(1)
    const goPrevWebentity = () => this.rotateWebentity(-1)

    return (
      <div className="browser-stack-wes">

        <button
          className="btn btn-default hint--bottom-right"
          aria-label={ formatMessage({ id: 'tooltip.stack-prev' }) }
          disabled={ !selectedStack || loading || isFirst || loadingWebentityStack }
          onClick={ goPrevWebentity }
        >
          <span className="ti-angle-left" />
        </button>

        <div className="browser-stack-wes-selector">
          <BrowserStackWesList 
            loadingStack = { loading }
            loadingWE = { loadingWebentityStack }
            selectedStack={ selectedStack }
            webentities={ webentities }
            selectedWebentity={ selectedWebentity }
            selectWebentity={ this.selectWebentity }
          />
          { this.renderProgress() }
        </div>

        <button
          className="btn btn-default hint--bottom-left"
          aria-label={ formatMessage({ id: 'tooltip.stack-next' }) }
          disabled={ !selectedStack || loading || isLast || loadingWebentityStack }
          onClick={ goNextWebentity }
        >
          <span className="ti-angle-right" />
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
  loading: PropTypes.bool,
  loadingWebentityStack: PropTypes.bool,
  locale: PropTypes.string.isRequired,
  server: PropTypes.object.isRequired,
  selectedStack: PropTypes.any,
  selectedWebentity: PropTypes.any,
  stacks: PropTypes.array.isRequired,
  webentities: PropTypes.array.isRequired,

  // actions
  emptyStack: PropTypes.func.isRequired,
  fetchStack: PropTypes.func.isRequired,
  openTab: PropTypes.func.isRequired,
  setTabUrl: PropTypes.func.isRequired,
  viewWebentity: PropTypes.func.isRequired,
  loadingWebentity: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, servers, stacks, tabs, webentities, intl: { locale } }) => ({
  activeTabId: tabs.activeTab && tabs.activeTab.id,
  corpus: corpora.selected,
  status: corpora.status,
  lastRefresh: stacks.lastRefresh,
  loading: stacks.loading,
  loadingWebentityStack: stacks.loadingWebentity,
  locale,
  server: servers.selected,
  selectedStack: stacks.selected,
  selectedWebentity: webentities.selected,
  stacks: stacks.list,
  webentities: stacks.webentities,
})

export default connect(mapStateToProps, {
  emptyStack,
  fetchStack,
  openTab,
  setTabUrl,
  viewWebentity,
  loadingWebentity
})(BrowserStack)
