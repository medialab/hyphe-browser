// creation / edition form of a Hyphe server instance
//
// local validation errors :
// - name and url must be filled
// async validation errors :
// - url points to a non hyphe server


import React from 'react'
import cx from 'classnames'
import { identity } from 'lodash'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage as T, injectIntl } from 'react-intl'

import { createServer, updateServer, deleteServer } from '../../actions/servers'\
import { fetchCorpora } from '../../actions/corpora'

const JSON_PLACEHOLDER = JSON.stringify(
  {
    name: 'My Hyphe server',
    url: 'http://example.com/hyphe/'
  },
  null,
  '  '
)

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

  renderFormGroup (name, label = name, type = 'text', autoFocus = false, disabled = false) {
    const { intl: { formatMessage } } = this.props
    return (
      <div className="form-group">
        <label><T id={ label } /></label>
        <input
          disabled={ disabled || this.state.submitting }
          name={ name }
          placeholder={ formatMessage({ id: label }) }
          autoFocus={ autoFocus }
          onChange={ ({ target }) => this.setDataState(name, target.value) }
          type={ type }
          value={ this.state.data[name] || '' }
        />
      </div>
    )
  }

  /**
   * Returns:
   * - `null` when no string config is set in the text area
   * - A string error message when the value is invalid
   * - The config object else
   */
  parseJSONConfig () {
    const { jsonConfig } = this.state.data

    if (!jsonConfig) return null

    try {
      const data = JSON.parse(jsonConfig)

      if (!data) return 'error.json-null-config'
      if (typeof data !== 'object' || Array.isArray(data)) return 'error.json-not-object'
      if (!data.url) return 'error.json-missing-url'
      if (!data.name) return 'error.json-missing-name'
      return data
    } catch (e) {
      return 'error.json-invalid-json'
    }
  }

  getInitData () {
    if (this.props.editMode) {
      return { ...this.props.server }
    }
    return {
      url: undefined,
      name: undefined,
      password: undefined,
      jsonConfig: undefined,
    }
  }

  onSubmit = (evt) => {
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

    const server = this.cleanData()

    // check for existing server with same URL
    if (!this.props.editMode && this.props.servers.some(({ url }) => url === server.url)) {
      newState.submitting = false
      newState.errors = ['error.server-url-already-used']
      return this.setState(newState)
    }

    // async validation
    this.props.fetchCorpora(server.url)
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
    this.props.history.push('/login')
  }

  cleanData () {
    const fullConfig = this.parseJSONConfig()
    const server = (fullConfig && typeof fullConfig === 'object') ?
      fullConfig :
      { ...this.state.data }

    if (!server.password) delete server.password
    if (!server.home) server.home = server.url.replace(/[/-]api\/?$/, '')

    return server
  }

  // local validation
  isValid () {
    const { url, name } = this.state.data
    const fullConfig = this.parseJSONConfig()

    return (fullConfig && typeof fullConfig === 'object') || (url && name)
  }

  delete = (evt) => {
    evt.preventDefault()
    this.props.deleteServer(this.props.server)
    this.props.history.push('/login')
  }

  render () {
    const { jsonConfig } = this.state.data
    const fullConfig = this.parseJSONConfig()

    return (
      <form className="server-form" onSubmit={ this.onSubmit }>
        <h3 className="section-header">
          <T id="create-or-configure-server" />
        </h3>
        {[typeof fullConfig === 'string' && fullConfig, ...this.state.errors].filter(identity).map((error) =>
          <div className="form-error" key={ error }><T id={ error } /></div>
        )}

        {this.renderFormGroup('name', 'server-name', 'text', false, jsonConfig)}
        {this.renderFormGroup('url', 'api-url', 'text', true, !!(this.props.server || {}).cloud || jsonConfig)}

        {false && this.renderFormGroup('login')}
        {false && this.renderFormGroup('password', 'password', 'password')}

        {
          !this.props.editMode &&
          <div
            className="form-group"
            style={ { borderTop: '1px solid var(--color-grey-dark)' } }
          >
            <label>...<strong><T id="or" /></strong>{' '}<T id="paste-json-config" /></label>
            <textarea
              value={ jsonConfig || '' }
              onChange={ ({ target }) => this.setDataState('jsonConfig', target.value) }
              placeholder={ JSON_PLACEHOLDER }
              style={ {
                resize: 'vertical',
                height: 200
              } }
            />
          </div>
        }

        <div className="buttons-row">
          <li>
            <Link className="btn btn-error" to="/login" disabled={ this.state.submitting }>
              <T id="cancel" />
            </Link>
          </li>
          <li className="main-button-container">
            <button className={ cx('btn btn-primary', { 'is-disabled': !this.isValid() }) } disabled={ this.state.submitting }>
              <T id="save-server" />
            </button>
          </li>
        </div>
      </form>
    )
  }
}

ServerForm.propTypes = {
  // router
  history: PropTypes.shape({
    push: PropTypes.func,
  }),

  editMode: PropTypes.bool,
  locale: PropTypes.string.isRequired,
  servers: PropTypes.array,
  server: PropTypes.object,

  // actions
  createServer: PropTypes.func,
  updateServer: PropTypes.func,
  deleteServer: PropTypes.func,
  fetchCorpora: PropTypes.func,
}

const mapStateToProps = ({ servers, intl: { locale } }) => ({
  // beware, edit could be set to null
  editMode: !!~window.location.href.indexOf('?edit'),
  locale,
  servers: servers.list,
  server: servers.selected
})

export default injectIntl(connect(mapStateToProps, {
  createServer,
  updateServer,
  deleteServer,
  fetchCorpora,
  // routerPush: routerActions.push,
})(ServerForm))
