import React, { PropTypes } from 'react'
import cx from 'classnames'

class BrowserTabWebentityNameField extends React.Component {

  constructor (props) {
    super(props)
    this.state = { value: props.initialValue || '' }
  }

  componentWillReceiveProps ({ initialValue }) {
    if (initialValue !== this.props.initialValue && initialValue !== this.state.value) {
      // Really a new URL (a priori incoming from Redux)
      this.setState({ value: initialValue })
    }
  }

  onChange (e) {
    e.stopPropagation()
    this.setState({ value: e.target.value })
    this.props.onChange(e.target.value)
  }

  render () {
    return <input className={ cx('form-control btn btn-large', { loading: !this.state.value }) }
      disabled={ this.props.disabled } // PAGE_HYPHE_HOME
      value={ this.state.value }
      readOnly={ !this.props.editable || !this.state.value }
      onChange={ (e) => this.onChange(e) }/>
  }
}

BrowserTabWebentityNameField.propTypes = {
  initialValue: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  editable: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
}

export default BrowserTabWebentityNameField
