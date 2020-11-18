// creation form of a corpus

// local validation errors :
// - password must equals passwordConfirm

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage as T, useIntl } from 'react-intl'

import { createCorpus } from '../../actions/corpora'
import Spinner from '../../components/Spinner'
import HelpPin from '../../components/HelpPin'

const creationRules = ['domain', 'subdomain', 'page']

const CorpusForm = ({
  serverStatus,
  server,
  serverError,
  location,
  createCorpus
}) => {

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    name: location.state && location.state.filterName,
    password: null,
    passwordConfirm: null
  })
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [advancedOptions, setAdvancedOptions] = useState(false)
  const [crawlDepth, setCrawlDepth] = useState(1)
  const [creationRule, setCreationRule] = useState('domain')

  const maxDepth = serverStatus && serverStatus.hyphe && serverStatus.hyphe.max_depth || 1
  const depths = [ ...Array(maxDepth).keys() ].map(i => i+1)
  const { formatMessage } = useIntl()

  useEffect(() => {
    if (serverError && serverError.messageId && serverError.messageId.includes('error.corpus-not-created')) {
      setSubmitting(false)
      setError(serverError)
    }
  }, [serverError])

  // deal with fields values
  const setDataState = (key, value) => {
    setData({
      ...data,
      [key]: value
    })
  }

  const renderFormGroup = (name, label = name, type = 'text', autoFocus = false) => {
    return (
      <div className="form-group">
        <label><T id={ label } /></label>
        <input
          disabled={ submitting }
          autoFocus={ autoFocus }
          name={ name }
          placeholder={ formatMessage({ id: label }) }
          onChange={ ({ target }) => setDataState(name, target.value) }
          type={ type }
          value={ data[name] || '' }
        />
      </div>
    )
  }

  const onSubmit = (evt) => {
    // no real submit to the server
    evt.preventDefault()

    if (!isValid()) {
      setSubmitting(false)
      setError({ messageId: 'error.password-mismatch' })
      setData({
        ...data,
        password: '',
        passwordConfirm: ''
      })
      return
    }
    setSubmitting(true)
    setError(null)

    const corpus = cleanData()
    createCorpus({
      server,
      corpus,
      options: {
        depthHypheBro: crawlDepth,
        defaultCreationRule: creationRule
      }
    })
  }

  const cleanData = () => {
    const corpus = {
      ...data
    }
    delete corpus.passwordConfirm
    if (!corpus.name) delete corpus.name
    if (!corpus.password) delete corpus.password
    return corpus
  }

  const isValid = () => {
    return data.password === data.passwordConfirm
  }

  const onTogglePasswordProtected = () => {
    // if disabling password protected clear the password
    if (passwordProtected) {
      setData({
        ...data,
        password: '',
        passwordConfirm: ''
      })
    }
    setPasswordProtected(!passwordProtected)
  }

  return (
    <form className="corpus-form" onSubmit={ onSubmit }>
      <h3 className="section-header">
        <T id="create-a-corpus" />
      </h3>
      { error &&
        <div className="form-error"><T id={ error.messageId } values={ error.messageValues || {} } /></div>
      }

      <div className="config-form">
        { submitting ?
          <h5>{data.name}</h5>
          :
          renderFormGroup('name', 'corpus-name', 'text', true)
        }
        <div className={ cx('options-wrapper', { active: passwordProtected }) }>
          {
            !submitting &&
            <div onClick={ onTogglePasswordProtected } className="form-group horizontal">
              <input readOnly checked={ passwordProtected } type="radio" />
              <label><T id="password-protected-creation" /></label>
            </div>
          }

          { passwordProtected && renderFormGroup('password', 'password', 'password') }
          { passwordProtected && renderFormGroup('passwordConfirm', 'confirm-password', 'password') }
        </div>
        <div className={ cx('options-wrapper', { active: advancedOptions }) }>
          {!submitting &&
            <div onClick={ () => setAdvancedOptions(!advancedOptions) } className="form-group horizontal">
              <input readOnly checked={ advancedOptions } type="radio" />
              <label><T id="advanced-creation-options" /></label>
            </div>
          }
          {advancedOptions &&
          <>
            <div className="form-group">
              <label><T id="depth-creation" />
                <HelpPin place="top">
                  {formatMessage({ id: "depth-creation-help" })}
                </HelpPin>
              </label>
              {
                depths.map((depth, index) => (
                  <div
                    key={ index }
                    className="form-group horizontal minified"
                    onClick={ () => setCrawlDepth(depth) }
                  >
                    <input readOnly type="radio" checked={ depth === crawlDepth } />
                    <label>{depth}</label>
                  </div>
                ))
              }
            </div>
            <div className="form-group">
              <label><T id="default-creation-rule" />
                <HelpPin place="top">
                  {formatMessage({ id: "default-creation-rule-help" })}
                </HelpPin>

              </label>
              {
                creationRules.map((rule, index) => (
                  <div
                    key={ index }
                    className="form-group horizontal minified"
                    onClick={ () => setCreationRule(rule) }
                  >
                    <input readOnly type="radio" checked={ creationRule === rule } />
                    <label>{rule}</label>
                  </div>
                ))
              }
            </div>
          </>
          }
        </div>
      </div>

      { submitting
        ? <Spinner />
        : (
          <div className="buttons-row">
            <li>
              <Link className="btn btn-error" to="/login"><T id="cancel" /></Link>
            </li>
            <li className="main-button-container">
              <button className={ cx('btn btn-primary', { 'is-disabled': !data.name }) } disabled={ submitting }>
                <T id="create-corpus" />
              </button>
            </li>
          </div>
        )
      }
    </form>
  )
}

CorpusForm.propTypes = {
  locale: PropTypes.string.isRequired,
  server: PropTypes.object,
  serverError: PropTypes.object,

  // actions
  createCorpus: PropTypes.func
}

const mapStateToProps = ({ servers, corpora, intl: { locale }, ui }) => ({
  locale,
  serverStatus: corpora.status,
  server: servers.selected,
  serverError: ui.notification
})

const ConnectedCorpusForm = connect(mapStateToProps, {
  createCorpus
})(CorpusForm)

export default ConnectedCorpusForm
