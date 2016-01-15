import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'

import { highlightUrlHTML } from '../../utils/lru'

class BrowserTabUrlField extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      url: props.initialUrl,
      editing: false,
      focusInput: false
    }
  }

  componentWillReceiveProps ({ initialUrl }) {
    if (initialUrl !== this.props.initialUrl && initialUrl !== this.state.url) {
      // Really a new URL (a priori incoming from Redux)
      this.setState({ url: initialUrl })
    }
  }

  shouldComponentUpdate ({ initialUrl, lruPrefixes }, { url, editing }) {
    return this.state.url !== initialUrl || this.state.url !== url // update only if URL *really* changes
      || this.props.lruPrefixes !== lruPrefixes || this.state.editing !== editing // Standard conditions on other props/state
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
    if (this.state.editing) {
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
  onSubmit: PropTypes.func.isRequired
}

export default BrowserTabUrlField
