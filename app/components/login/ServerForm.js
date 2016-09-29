// creation / edition form of a Hyphe server instance
//
// local validation errors :
// - name and url must be filled
// async validation errors :
// - url points to a non hyphe server


import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { routerActions } from 'react-router-redux'
import { FormattedMessage as T } from 'react-intl'

import { createServer, updateServer, deleteServer } from '../../actions/servers'
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
        <input disabled={ this.state.submitting }
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
      url: undefined,
      name: undefined,
      password: undefined,
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
      }, () => {
        newState.submitting = false
        newState.errors = ['error.server-url']
        this.setState(newState)
      })
  }

  saveAndRedirect () {
    const server = this.cleanData()
    !this.props.editMode
      ? this.props.createServer(server)
      : this.props.updateServer(server)

    // sync redirect
    this.props.routerPush('/login')
  }

  cleanData () {
    let server = {
      ...this.state.data
    }
    if (!server.password) {
      delete server.password
    }
    if (!server.home) {
      server.home = server.url.replace(/-api$/, '')
    }
    return server
  }

  // local validation
  isValid () {
    return this.state.data.url && this.state.data.name
  }

  delete (evt) {
    evt.preventDefault()
    this.props.deleteServer(this.props.server)
    this.props.routerPush('/login')
  }

  render () {

    return (
      <form className="server-form" onSubmit={ (evt) => this.onSubmit(evt) }>

        { this.state.errors.map((error) =>
          <div className="form-error" key={ error }><T id={ error } /></div>
        ) }

        { this.renderFormGroup('url', 'api-url') }
        { this.renderFormGroup('name', 'server-name') }

        { false && this.renderFormGroup('login') }
        { false && this.renderFormGroup('password', 'password', 'password') }

        <div className="form-actions">
          <button className="btn btn-primary" disabled={ this.state.submitting }>
            <T id="save" />
          </button>
          <Link className="btn btn-default" to="/login" disabled={ this.state.submitting }>
            <T id="cancel" />
          </Link>
          { this.props.editMode &&
            (
              <button className="btn btn-negative" disabled={ this.state.submitting }
                  onClick={ (evt) => this.delete(evt) }>
                 <T id="delete" />
              </button>
            )
          }
        </div>
      </form>
    )
  }
}

ServerForm.propTypes = {
  editMode: PropTypes.bool,
  locale: PropTypes.string.isRequired,
  server: PropTypes.object,

  // actions
  createServer: PropTypes.func,
  updateServer: PropTypes.func,
  deleteServer: PropTypes.func,
  routerPush: PropTypes.func,
}

const mapStateToProps = ({ servers, intl: { locale } }, { location }) => ({
  // beware, edit could be set to null
  editMode: location.query.edit !== undefined,
  locale,
  server: servers.selected
})

export default connect(mapStateToProps, {
  createServer,
  updateServer,
  deleteServer,
  routerPush: routerActions.push,
})(ServerForm)
