// creation / edition form of a Hyphe server instance
//
// local validation errors :
// - name and url must be filled

import '../../css/login/server-form'

import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { pushPath } from 'redux-simple-router'
import { FormattedMessage as T } from 'react-intl'

import * as actions from '../../actions/servers'
import { FORM_CREATE, FORM_EDIT } from '../../constants'

class ServerForm extends React.Component {

  // generic form methods

  constructor (props) {
    super(props)

    // beware, edit could be set to null
    const mode = props.location.query.edit !== undefined
      ? FORM_EDIT
      : FORM_CREATE

    this.state = {
      submitting: false,
      errors: [],
      data: this.getInitData(mode),
      mode
    }
  }

  // deal with fields values
  setDataState (key, value) {
    const data = {
      ...this.state.data,
      [key]: value
    }
    this.setState({ data })
  }

  renderFormGroup (name, label) {
    return (
      <div className="form-group">
        <label><T id={ label || name } /></label>
        <input className="form-control"
               disabled={ this.state.submitting }
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
    const newState = {
      submitting: true,
      errors: []
    }

    if (!this.isValid()) {
      newState.submitting = false
      newState.errors = ['url-and-name-required']
      // TODO deal with login / password when ready on server side
      return this.setState(newState)
    }
    this.setState(newState)

    const server = this.cleanData()
    this.state.mode === FORM_CREATE
      ? this.props.actions.createServer(server)
      : this.props.actions.updateServer(server)

    this.props.dispatch(pushPath('/login'))
  }

  cleanData () {
    let server = {
      ...this.state.data
    }
    delete server.passwordConfirm
    if (!server.password) delete server.password
    return server
  }

  isValid () {
    return this.state.data.url && this.state.data.name
  }

  delete (evt) {
    evt.preventDefault()
    this.props.actions.deleteServer(this.props.selectedServer)
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
        { this.renderFormGroup('login') }
        { this.renderFormGroup('password') }
        { this.renderFormGroup('passwordConfirm', 'confirm-password') }

        <div className="form-actions">
          <button className="btn btn-primary" disabled={ this.state.submitting }>
            <T id="save" />
          </button>
          <Link className="btn btn-default" to="/login" disabled={ this.state.submitting }>
            <T id="cancel" />
          </Link>
          { this.state.mode === FORM_EDIT
            ? (
              <button className="btn btn-negative" disabled={ this.state.submitting }
                  onClick={ (evt) => this.delete(evt) }>
                 <T id="delete" />
              </button>
            )
            : null
          }
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
