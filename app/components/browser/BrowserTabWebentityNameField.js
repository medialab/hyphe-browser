import React, { PropTypes } from 'react'

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
    const value = this.state.value || (this.props.editable ? '' : '…')

    return <input className="btn btn-large" type="text" value={ value }
      readOnly={ !this.props.editable } onChange={ (e) => this.onChange(e) }/>
  }
}

BrowserTabWebentityNameField.propTypes = {
  initialValue: PropTypes.string,
  editable: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
}

export default BrowserTabWebentityNameField
