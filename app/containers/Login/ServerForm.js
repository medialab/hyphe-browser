// creation / edition form of a Hyphe server instance
//
// local validation errors :
// - name and url must be filled
// async validation errors :
// - url points to a non hyphe server


import React, { useState } from 'react'
import cx from 'classnames'
import { clipboard } from 'electron'
import { identity } from 'lodash'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage as T, useIntl } from 'react-intl'

import { createServer, updateServer, deleteServer } from '../../actions/servers'
import { fetchCorpora, fetchServerStatus } from '../../actions/corpora'

// for async validation
// import jsonrpc from '../../utils/jsonrpc'

const JSON_PLACEHOLDER = JSON.stringify(
  {
    name: 'My Hyphe server',
    url: 'http://example.com/hyphe/'
  },
  null,
  '  '
)

const ServerForm = ({
  editMode,
  servers,
  server,
  history,
  fetchCorpora,
  fetchServerStatus,
  createServer,
  updateServer,
}) => {
  const { formatMessage } = useIntl()

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState([])
  const [data, setData] = useState(editMode ? { ...server } : {
    url: undefined,
    name: undefined,
    password: undefined,
    jsonConfig: undefined,
  })
  // deal with fields values
  const setDataState = (key, value) => {
    setData({
      ...data,
      [key]: value
    })
  }

  const renderFormGroup = (name, label = name, type = 'text', autoFocus = false, disabled = false)  => {
    return (
      <div className="form-group">
        <label><T id={ label } /></label>
        <input
          disabled={ disabled || submitting }
          name={ name }
          placeholder={ formatMessage({ id: label }) }
          autoFocus={ autoFocus }
          onChange={ ({ target }) => setDataState(name, target.value) }
          type={ type }
          value={ data[name] || '' }
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
  const parseJSONConfig = () => {
    const { jsonConfig } = data

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

  const fullConfig = parseJSONConfig()
  const { jsonConfig } = data
  const serverConfig = JSON.stringify(data, null, '  ')

  const onSubmit = (evt) => {
    // no real submit to the server
    evt.preventDefault()

    // local validation errors
    if (!isValid()) {
      setSubmitting(false)
      setErrors(['error.url-and-name-required'])
      // TODO deal with login / password when ready on server side
      return
    }

    const server = cleanData()

    // check for existing server with same URL
    if (!editMode && servers.some(({ url }) => url === server.url)) {
      setSubmitting(false)
      setErrors['error.server-url-already-used']
      return
    }

    // async validation
    fetchServerStatus(server.url)
      .then(() => {
        setSubmitting(true)
        setErrors([])
        fetchCorpora(server.url)
        saveAndRedirect()
      }, () => {
        setSubmitting(false)
        setErrors(['error.server-url'])
      })
  }

  const saveAndRedirect = () => {
    const server = cleanData()
    !editMode
      ? createServer(server)
      : updateServer(server)

    // sync redirect
    history.push('/login')
  }

  const cleanData = () => {
    const server = (fullConfig && typeof fullConfig === 'object') ?
      fullConfig :
      { ...data }

    server.url = server.url.replace(/#.*$/, '').replace(/(\/|-?api)*$/, '-api/')
    if (server.url.split('/').length < 5) {
      server.url = server.url.replace('-api/', '/api/');
    }

    if (!server.password) delete server.password
    server.home = server.url.replace(/[/-]+api\/+?$/, '/')

    return server
  }

  // local validation
  const isValid = () => {
    const { url, name } = data
    return (fullConfig && typeof fullConfig === 'object') || (url && name)
  }

  // const delete = (evt) => {
  //   evt.preventDefault()
  //   this.props.deleteServer(this.props.server)
  //   this.props.history.push('/login')
  // }
  return (
    <>
      <form className="server-form" onSubmit={ onSubmit }>
        <h3 className="section-header">
          <T id="create-or-configure-server" />
        </h3>

        {[typeof fullConfig === 'string' && fullConfig, ...errors].filter(identity).map((error) =>
          <div className="form-error" key={ error }><T id={ error } /></div>
        )}

        {renderFormGroup('name', 'server-name', 'text', false, jsonConfig)}
        {renderFormGroup('url', 'api-url', 'text', true, !!(server || {}).cloud || jsonConfig)}

        {false && renderFormGroup('login')}
        {false && renderFormGroup('password', 'password', 'password')}

        {
          !editMode &&
          <div
            className="form-group"
            style={ { borderTop: '1px solid var(--color-grey-dark)' } }
          >
            <label>...<strong><T id="or" /></strong>{' '}<T id="paste-json-config" /></label>
            <textarea
              value={ jsonConfig || '' }
              onChange={ ({ target }) => setDataState('jsonConfig', target.value) }
              placeholder={ JSON_PLACEHOLDER }
              style={ {
                resize: 'vertical',
                height: 200
              } }
            />
          </div>
        }

        {
          editMode &&
          <div
            className="form-group"
            style={ { borderTop: '1px solid var(--color-grey-dark)' } }
          >
            <label>
              <span><T id="export-this-server-config" /></span>
              <button
                style={ { float: 'right' } }
                onClick={ () => {
                  clipboard.writeText(serverConfig)
                  window.alert(formatMessage({ id: 'export-this-server-config-text' }))
                } }
                className="hint--bottom-left"
                aria-label={ formatMessage({ id: 'export-this-server-config' }) }
              >
                <i className="ti-export" />
              </button>
            </label>
            <textarea
              readOnly
              value={ serverConfig }
              style={ {
                resize: 'none',
                height: '200px',
                overflow: 'hidden',
                width: '100%'
              } }
            />
          </div>
        }

        <div className="buttons-row">
          <li>
            <Link className="btn btn-error" to="/login" disabled={ submitting }>
              <T id="cancel" />
            </Link>
          </li>
          <li className="main-button-container">
            <button className={ cx('btn btn-primary', { 'is-disabled': !isValid() }) } disabled={ submitting }>
              <T id="save-server" />
            </button>
          </li>
        </div>
      </form>
    </>
  )
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

export default connect(mapStateToProps, {
  createServer,
  updateServer,
  deleteServer,
  fetchCorpora,
  fetchServerStatus,
  // routerPush: routerActions.push,
})(ServerForm)
