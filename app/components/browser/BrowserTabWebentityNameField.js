import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import cx from 'classnames'

import '../../css/browser/browser-tab-webentity-name-field'

class BrowserTabWebentityNameField extends React.Component {

  constructor (props) {
    super(props)

    this.state = { dirty: false }

    this._onKeyUp = this.onKeyUp.bind(this)
    this._onChange = this.onChange.bind(this)
  }

  onKeyUp (e) {
    if (e.keyCode === 13) { // ENTER
      e.stopPropagation()
      this.setState({ dirty: false })
      e.target.blur()
      this.props.onChange(e.target.value)
    } else if (e.keyCode === 27) { // ESCAPE
      e.stopPropagation()
      this.setState({ dirty: false })
      e.target.value = this.props.initialValue
    }
  }

  onChange (e) {
    this.setState({ dirty: true })
  }

  // React told me:
  // "Well dude, you chose to make an uncontrolled input, now YOU control it yourself"
  // Had to agree
  componentWillReceiveProps ({ initialValue }) {
    if (!this.state.dirty) {
      findDOMNode(this).value = initialValue
    }
  }

  render () {
    return <input className={ cx('browser-tab-webentity-name over-overlay', { loading: !this.props.initialValue }) }
      disabled={ this.props.disabled } // PAGE_HYPHE_HOME
      defaultValue={ this.props.initialValue }
      readOnly={ !this.props.editable || !this.props.initialValue }
      onKeyUp={ this._onKeyUp }
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
