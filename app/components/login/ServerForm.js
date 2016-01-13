// creation / edition form of a Hyphe server instance

import '../../css/login/server-form'

import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { FormattedMessage as T } from 'react-intl'

class ServerForm extends Component {

  // generic form methods

  constructor (props) {
    super(props)
    this.state = this.getInitState()
  }

  // proxy for setState
  setFormState (key, value) {
    let state = {
      ...this.state,
      [key]: value
    }
    this.setState(state)
  }

  // deal with fields values
  setDataState (key, value) {
    let data = {
      ...this.state.data,
      [key]: value
    }
    this.setFormState('data', data)
  }

  onChangeData (evt) {
    this.setDataState(evt.target.name, evt.target.value)
  }

  renderFormGroup (name, label) {
    return (
      <div className="form-group">
        <label><T id={ label || name } /></label>
        <input className="form-control"
               name={ name }
               onChange={ (evt) => this.onChangeData(evt) }
               value={ this.state.data[name] } />
      </div>
    )
  }

  getInitState () {
    return {
      // form state
      disabled: false,
      errors: [],
      // fields values
      data: {
        url: null,
        name: null,
        password: null,
        passwordConfirm: null
      }
    }
  }

  onSubmit (evt) {
    evt.preventDefault()
  }

  render () {
    return (
      <form className="server-form" onSubmit={ (evt) => this.onSubmit(evt) }>
        <h2 className="pane-centered-title"><T id="server-edition" /></h2>

        <hr />

        { this.renderFormGroup('url', 'api-url') }
        { this.renderFormGroup('name', 'server-name') }
        { this.renderFormGroup('password') }
        { this.renderFormGroup('passwordConfirm', 'confirm-password') }

        <div className="form-actions">
          <button className="btn btn-primary" disabled={ this.state.disabled }>
            <T id="save" />
          </button>
          <Link className="btn btn-default" to="/login"><T id="cancel" /></Link>
        </div>
      </form>
    )
  }
}

ServerForm.propTypes = {

}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = (dispatch) => ({

})

const ConnectedServerForm = connect(mapStateToProps, mapDispatchToProps)(ServerForm)

export default ConnectedServerForm

