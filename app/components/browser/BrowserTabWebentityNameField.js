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
    if (!this.state.value) {
      // Loading
      return <input className="form-control btn btn-large loading" type="text" readOnly />
    }

    return <input className="form-control btn btn-large" type="text"
      value={ this.state.value }
      readOnly={ !this.props.editable }
      onChange={ (e) => this.onChange(e) }/>
  }
}

BrowserTabWebentityNameField.propTypes = {
  initialValue: PropTypes.string,
  editable: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
}

export default BrowserTabWebentityNameField
