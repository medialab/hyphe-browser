import './browser-tab-url-field'

import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import cx from 'classnames'
import { isWebUri } from 'valid-url'
import { FormattedMessage as T } from 'react-intl'

import { highlightUrlHTML, urlToLru, lruToUrl, longestMatching, parseLru } from '../../utils/lru'
import { getSearchUrl } from '../../utils/search-web'

class BrowserTabUrlField extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      url: props.initialUrl,
      editing: false,
      focusInput: false,
      overPrefixUntil: -1,
      userPrefixUntil: -1
    }
  }

  componentWillReceiveProps ({ initialUrl, prefixSelector }) {
    if (prefixSelector && !this.props.prefixSelector) {
      // Reset prefix information before rendering prefix selector
      this.setState({ overPrefixUntil: -1, userPrefixUntil: -1 })
    }
    if (initialUrl !== this.props.initialUrl && initialUrl !== this.state.url) {
      // Really a new URL (a priori incoming from Redux)
      this.setState({ url: initialUrl })
    }
  }

  shouldComponentUpdate ({ initialUrl, lruPrefixes, prefixSelector, loading, crawlquery }, { url, editing, overPrefixUntil }) {
    return this.state.url !== initialUrl || this.state.url !== url // update only if URL *really* changes
      // Standard conditions on other props/state
      || this.props.lruPrefixes !== lruPrefixes
      || this.props.loading !== loading
      || this.props.crawlquery !== crawlquery
      || this.state.editing !== editing
      || this.props.prefixSelector !== prefixSelector
      || this.state.overPrefixUntil !== overPrefixUntil
  }

  componentDidUpdate () {
    if (this.state.editing && this.state.focusInput) {
      findDOMNode(this).querySelector('input').select()
    } else if (this.props.prefixSelector) {
      findDOMNode(this).querySelector('div').focus()
    }
  }

  onKeyUp = (e) => {
    if (e.keyCode === 27) { // ESCAPE
      e.target.blur()
      this.setState({ url: this.props.initialUrl })
    }
  }

  onBlur = () => {
    this.setState({ editing: false })
  }
  
  onSubmit = (e) => {
    e.preventDefault()
    const { selectedEngine } = this.props
    this.setState({ editing: false })

    const url = ((u) => {
      if (!isWebUri(u)) {
        const httpu = 'http://' + u
        if (isWebUri(httpu)) {
          this.setState({ url: httpu })
          return httpu
        } else {
          const searchu = getSearchUrl(selectedEngine, u)
          this.setState({ url: searchu })
          return searchu
        }
      } else {
        return u
      }
    })(this.state.url.trim())

    this.props.onSubmit(url)
  }

  onChange = (e) => {
    e.stopPropagation()
    this.setState({ url: e.target.value, focusInput: false })
  }

  renderField () {
    if (this.props.prefixSelector) {
      return this.renderPrefixSelector()
    } else if (this.state.editing) {
      return this.renderFieldInput()
    } else {
      return this.renderFieldHighlighted()
    }
  }

  // Read-write field: standard input
  renderFieldInput () {
    return <input
      className={ cx('btn browser-tab-url', { loading: this.props.loading }) }
      type="text"
      value={ this.state.url }
      onBlur={ this.onBlur }
      onKeyUp={ this.onKeyUp }
      onChange={ this.onChange } />
  }

  // Read-only field with highlights: click to edit
  renderFieldHighlighted () {
    const className = cx('btn browser-tab-url', { loading: this.props.loading }, { startcrawl: this.props.crawlquery } )
    const onClick = () => this.setState({ editing: true, focusInput: true })

    if (!this.props.lruPrefixes) {
      return (
        <span className={ className } onClick={ onClick }>
          {
            this.state.url ||
            <span className="browser-tab-url-placeholder"><T id="empty-url" /></span>
          }
        </span>
      )
    }

    return <span className={ className } onClick={ this.props.crawlquery ? null : onClick }
      dangerouslySetInnerHTML={ {
        __html: highlightUrlHTML(this.props.lruPrefixes, this.state.url, this.props.tlds)
      } } />
  }

  // LRU selector by prefix: click to select
  renderPrefixSelector () {
    const matching = longestMatching(this.props.lruPrefixes, this.state.url, this.props.tlds)
    const lru = (matching && matching.lru) || parseLru({}, this.props.tlds)
    const url = urlToLru(this.state.url, this.props.tlds)

    const parts = [ [ 'scheme', url.scheme + '://', url.scheme === lru.scheme ] ]
      .concat( url.tld ? [ [ 'tld', url.tld, url.tld === lru.tld ] ] : [])
      .concat(url.host.map((h, i) => [ 'host', '.' + h, url.host[i] === lru.host[i] ]))
      .concat([ [ 'port', url.port && (':' + url.port), url.port === lru.port ] ])
      .concat((url.path.length === 0 && (url.query || url.fragment))
        ? [ [ 'path', '/', lru.path.length === 0 && (lru.query || lru.fragment) ] ]
        : url.path.map((p, i) => [ 'path', '/' + p, url.path[i] === lru.path[i] ]))
      .concat([ [ 'query', url.query && ('?' + url.query), url.query === lru.query ] ])
      .concat([ [ 'fragment', url.fragment && ('#' + url.fragment), url.fragment === lru.fragment ] ])

    return (
      <div tabIndex="0" className="form-control btn browser-tab-prefix-selector">
        <div className="btn-group" onMouseOut={ () => this.setState({ overPrefixUntil: -1 }) }>
          { parts.map((p, i, a) => this.renderPrefixSelectorButton(p, i, a, lruToUrl(lru))) }
        </div>
      </div>
    )
  }

  // One part of the prefix selector: hover to overview, click to choose
  renderPrefixSelectorButton ([ prop, label, selected ], index, allParts, originalLruUrl) { 
    const selectPrefix = () => {
      const selected = allParts.slice(0, index + 1)
  
      // Build URL prefix from this
      const lru = selected.reduce((o, [prop, value]) => {
        o[prop] = {
          scheme: () => value.substring(0, value.length - 3), // remove '://'
          tld: () => value,
          host: () => (o.host || []).concat([ value.substring(1) ]), // remove '.' and concat
          port: () => value.substring(1), // remove ':'
          path: () => (o.path || []).concat([ value.substring(1) ]), // remove '.' and concat
          query: () => value.substring(1), // remove '?'
          fragment: () => value.substring(1) // remove '#'
        }[prop]()
        return o
      }, {})
      const lruUrl = lruToUrl(lru, this.props.tlds)
  
      this.props.onSelectPrefix(lruUrl, lruUrl !== originalLruUrl)
      this.setState({ userPrefixUntil: index })
    }
    if (label) {
      const classes = [
        'btn btn-default prefix',
        { 'prefix-selected': (this.state.userPrefixUntil >= 1) ? (index <= this.state.userPrefixUntil) : selected },
        { 'prefix-over': index <= this.state.overPrefixUntil }
      ]
      return (
        <button key={ 'prefix-selector-' + index } className={ cx(classes) }
          disabled={ index <= 1 } // can't be limited to protocol and tld
          onMouseOver={ () => this.setState({ overPrefixUntil: index }) }
          onClick={ selectPrefix }>
          { label }
        </button>
      )
    } else {
      return null
    }
  }

  render () {
    return (
      <form onSubmit={ this.onSubmit } className={ cx(this.props.className, { adjusting: this.props.prefixSelector }) }>
        { this.renderField() }
      </form>
    )
  }
}

BrowserTabUrlField.propTypes = {
  initialUrl: PropTypes.string.isRequired,
  lruPrefixes: PropTypes.arrayOf(PropTypes.string),
  selectedEngine: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  crawlquery: PropTypes.bool.isRequired,
  prefixSelector: PropTypes.bool.isRequired,
  onSelectPrefix: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  tlds: PropTypes.object,
  className: PropTypes.string
}

BrowserTabUrlField.defaultProps = {
  className: ''
}

export default BrowserTabUrlField
