// creation / edition form of a Hyphe server instance
//
// local validation errors :
// - name and url must be filled
// async validation errors :
// - url points to a non hyphe server

import '../../css/login/server-form'

import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { routeActions } from 'react-router-redux'
import { FormattedMessage as T } from 'react-intl'

import * as actions from '../../actions/servers'
// for async validation
import jsonrpc from '../../utils/jsonrpc'

class ServerForm extends React.Component {

  // generic form methods

  constructor (props) {
    super(props)

    this.state = {
      submitting: false,
      errors: [],
      data: this.getInitData()
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

  renderFormGroup (name, label = name, type = 'text') {
    return (
      <div className="form-group">
        <label><T id={ label } /></label>
        <input className="form-control"
               disabled={ this.state.submitting }
               name={ name }
               onChange={ ({ target }) => this.setDataState(name, target.value) }
               type={ type }
               value={ this.state.data[name] } />
      </div>
    )
  }

  getInitData () {
    if (this.props.editMode) {
      return { ...this.props.server }
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

    // local validation errors
    if (!this.isValid()) {
      newState.submitting = false
      newState.errors = ['error.url-and-name-required']
      // TODO deal with login / password when ready on server side
      return this.setState(newState)
    }

    // async validation
    jsonrpc(this.state.data.url)('list_corpus')
      .then(() => {
        this.setState(newState)
        this.saveAndRedirect()
      }, (err) => {
        newState.submitting = false
        newState.errors = ['error.server-url']
        this.setState(newState)
      })
  }

  saveAndRedirect () {
    const server = this.cleanData()
    !this.props.editMode
      ? this.props.actions.createServer(server)
      : this.props.actions.updateServer(server)

    // sync redirect
    this.props.dispatch(routeActions.push('/login'))
  }

  cleanData () {
    let server = {
      ...this.state.data
    }
    delete server.passwordConfirm
    if (!server.password) delete server.password
    return server
  }

  // local validation
  isValid () {
    return this.state.data.url && this.state.data.name
  }

  delete (evt) {
    evt.preventDefault()
    this.props.actions.deleteServer(this.props.server)
    this.props.dispatch(routeActions.push('/login'))
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
        { this.renderFormGroup('password', 'password', 'password') }
        { this.renderFormGroup('passwordConfirm', 'confirm-password', 'password') }

        <div className="form-actions">
          <button className="btn btn-primary" disabled={ this.state.submitting }>
            <T id="save" />
          </button>
          <Link className="btn btn-default" to="/login" disabled={ this.state.submitting }>
            <T id="cancel" />
          </Link>
          { this.props.editMode
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
  editMode: PropTypes.bool,
  server: PropTypes.object
}

const mapStateToProps = (state, { location }) => ({
  // beware, edit could be set to null
  editMode: location.query.edit !== undefined,
  server: state.servers.selected
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  dispatch
})

const ConnectedServerForm = connect(mapStateToProps, mapDispatchToProps)(ServerForm)

export default ConnectedServerForm
