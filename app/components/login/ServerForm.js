// creation / edition form of a Hyphe server instance

import '../../css/login/server-form'

import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { pushPath } from 'redux-simple-router'
import { FormattedMessage as T } from 'react-intl'

import * as actions from '../../actions/servers'
import { FORM_CREATE, FORM_EDIT } from '../../constants'

class ServerForm extends Component {

  // generic form methods

  constructor (props) {
    super(props)

    // beware, edit could be set to null
    const mode = props.location.query.edit !== undefined
      ? FORM_EDIT
      : FORM_CREATE

    this.state = {
      disabled: false,
      errors: [],
      data: this.getInitData(mode),
      mode
    }
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

  renderFormGroup (name, label) {
    return (
      <div className="form-group">
        <label><T id={ label || name } /></label>
        <input className="form-control"
               disabled={ this.state.disabled }
               name={ name }
               onChange={ ({ target }) => this.setDataState(name, target.value) }
               value={ this.state.data[name] } />
      </div>
    )
  }

  getInitData (mode) {
    if (mode === FORM_EDIT) {
      return { ...this.props.selectedServer }
    }
    return {
      url: null,
      name: null,
      password: null,
      passwordConfirm: null
    }
  }

  onSubmit (evt) {
    // no real submit to the server
    evt.preventDefault()
    this.setFormState('disabled', true)
    this.setFormState('errors', [])

    // validation
    if (!this.state.data.url || !this.state.data.name) {
      this.setFormState('disabled', false)
      this.setFormState('errors', ['url-and-name-required'])
      return
    }

    let server = {
      ...this.state.data
    }

    this.state.mode === FORM_CREATE
      ? this.props.actions.createServer(server)
      : this.props.actions.updateServer(server)

    this.props.dispatch(pushPath('/login'))
  }

  render () {

    return (
      <form className="server-form" onSubmit={ (evt) => this.onSubmit(evt) }>
        <h2 className="pane-centered-title"><T id="server-edition" /></h2>

        { this.state.errors.map((error) =>
          <div className="form-error" key={ error }><T id={ error } /></div>
        ) }

        <hr />

        { this.renderFormGroup('url', 'api-url') }
        { this.renderFormGroup('name', 'server-name') }
        { this.renderFormGroup('password') }
        { this.renderFormGroup('passwordConfirm', 'confirm-password') }

        <div className="form-actions">
          <button className="btn btn-primary" disabled={ this.state.disabled }>
            <T id="save" />
          </button>
          <Link className="btn btn-default" to="/login" disabled={ this.state.disabled }>
            <T id="cancel" />
          </Link>
        </div>
      </form>
    )
  }
}

ServerForm.propTypes = {
  actions: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  selectedServer: PropTypes.object
}

const mapStateToProps = (state) => ({
  selectedServer: state.servers.selected
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  dispatch
})

const ConnectedServerForm = connect(mapStateToProps, mapDispatchToProps)(ServerForm)

export default ConnectedServerForm
