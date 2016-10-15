import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import cx from 'classnames'

import '../../css/browser/browser-tab-webentity-name-field'

class BrowserTabWebentityNameField extends React.Component {

  constructor (props) {
    super(props)

    this.state = { dirty: false, editing: false }

    this._onKeyUp = this.onKeyUp.bind(this)
    this._onChange = this.onChange.bind(this)
    this._onFocus = this.onFocus.bind(this)
    this._onBlur = this.onBlur.bind(this)
  }

  onKeyUp (e) {
    if (e.keyCode === 13) { // ENTER
      e.stopPropagation()
      this.setState({ dirty: false, editing: false })
      e.target.blur()
      this.props.onChange(e.target.value)
    } else if (e.keyCode === 27) { // ESCAPE
      e.stopPropagation()
      this.setState({ dirty: false })
      e.target.value = this.props.initialValue
    }
  }

  onChange (e) {
    this.setState({ dirty: true, editing: true })
  }

  onFocus () {
    this.setState({ editing: true })
  }

  onBlur () {
    this.setState({ editing: false })
  }

  // React told me:
  // "Well dude, you chose to make an uncontrolled input, now YOU control it yourself"
  // Had to agree
  componentWillReceiveProps ({ initialValue }) {
    if (!this.state.editing && !this.state.dirty) {
      findDOMNode(this).value = initialValue
    }
  }

  shouldComponentUpdate ({ initialValue, disabled, editable }) {
    if (disabled !== this.props.disabled) {
      return true
    }
    if (editable !== this.props.editable) {
      return true
    }
    if (!this.state.dirty && initialValue !== this.props.initialValue) {
      return true
    }
    return false
  }

  render () {
    return <input className={ cx('browser-tab-webentity-name over-overlay', { loading: !this.props.initialValue }) }
      disabled={ this.props.disabled } // PAGE_HYPHE_HOME
      defaultValue={ this.props.initialValue }
      readOnly={ !this.props.editable || !this.props.initialValue }
      onKeyUp={ this._onKeyUp }
      onFocus={ this._onFocus }
      onBlur={ this._onBlur }
      onChange={ this._onChange } />
  }
}

BrowserTabWebentityNameField.propTypes = {
  initialValue: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  editable: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
}

BrowserTabWebentityNameField.defaultProps = {
  initialValue: ''
}

export default BrowserTabWebentityNameField
