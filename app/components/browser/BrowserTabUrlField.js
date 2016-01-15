import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'

import { highlightUrlHTML, urlToLru, lruToUrl } from '../../utils/lru'

class BrowserTabUrlField extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      url: props.initialUrl,
      editing: false,
      focusInput: false,
      prefix: ''
    }
  }

  componentWillReceiveProps ({ initialUrl }) {
    if (initialUrl !== this.props.initialUrl && initialUrl !== this.state.url) {
      // Really a new URL (a priori incoming from Redux)
      this.setState({ url: initialUrl })
    }
  }

  shouldComponentUpdate ({ initialUrl, lruPrefixes, prefixSelector }, { url, editing }) {
    return this.state.url !== initialUrl || this.state.url !== url // update only if URL *really* changes
      // Standard conditions on other props/state
      || this.props.lruPrefixes !== lruPrefixes
      || this.state.editing !== editing
      || this.props.prefixSelector !== prefixSelector
  }

  componentDidUpdate () {
    if (this.state.editing && this.state.focusInput) {
      findDOMNode(this).querySelector('input').select()
    }
  }

  onSubmit (e) {
    e.preventDefault()

    const url = ((u) => {
      if (!u.match(/:\/\//)) {
        this.setState({ url: 'http://' + u })
        return 'http://' + u
      } else {
        return u
      }
    })(this.state.url)

    this.props.onSubmit(url)
  }

  onChange (e) {
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

  renderFieldInput () {
    return <input className="form-control btn btn-large" type="text" value={ this.state.url }
      onBlur={ () => this.setState({ editing: false }) }
      onChange={ (e) => this.onChange(e) } />
  }

  renderFieldHighlighted () {
    const urlHTML = this.props.lruPrefixes
      ? highlightUrlHTML(this.props.lruPrefixes, this.state.url)
      : this.state.url

    return <span className="form-control btn btn-large browser-tab-url"
      onClick={ () => this.setState({ editing: true, focusInput: true }) }
      dangerouslySetInnerHTML={ { __html: urlHTML } } />
  }

  renderPrefixButton (label, index) {
    if (label) {
      return <button key={ 'prefix-selector-' + index } className='btn btn-default'>{ label }</button>
    } else {
      return null
    }
  }

  renderPrefixSelector () {
    const lru = urlToLru(this.state.url)

    const parts = [ lru.scheme + '://' ]
      .concat(lru.host.map((h) => '.' + h))
      .concat([ lru.port && (':' + lru.port) ])
      .concat((lru.path.length === 0 && lru.query || lru.fragment)
        ? [ '/' ]
        : lru.path.map((p) => '/' + p))
      .concat([ lru.query && ('?' + lru.query) ])
      .concat([ lru.fragment && ('#' + lru.fragment) ])

    return (
      <span className="form-control btn btn-large browser-tab-prefix-selector">
        Prefix Selector (Work In Progress)
        { parts.map((p, i) => this.renderPrefixButton(p, i)) }
      </span>
    )

  }

  render () {
    return (
      <form onSubmit={ (e) => this.onSubmit(e) }>
        { this.renderField() }
      </form>
    )
  }
}

BrowserTabUrlField.propTypes = {
  initialUrl: PropTypes.string.isRequired,
  lruPrefixes: PropTypes.arrayOf(PropTypes.string),
  onSubmit: PropTypes.func.isRequired,
  prefixSelector: PropTypes.bool.isRequired,
  onSubmitPrefix: PropTypes.func.isRequired
}

export default BrowserTabUrlField
