// creation form of a corpus

// local validation errors :
// - password must equals passwordConfirm

import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage as T, injectIntl } from 'react-intl'

import { createCorpus } from '../../actions/corpora'
import Spinner from '../../components/Spinner'
import HelpPin from '../../components/HelpPin'

const creationRules = ['domain', 'subdomain', 'page']
class CorpusForm extends React.Component {

  // generic form methods

  constructor (props) {
    super(props)
    this.state = {
      submitting: false,
      error: null,
      data: this.getInitData(props),
      passwordProtected: false,
      advancedOptions: false,
      crawlDepth: 1,
      creationRule: 'subdomain'
    }
  }

  componentWillReceiveProps ({ serverError }) {
    if (serverError && serverError.messageId && serverError.messageId.includes('error.corpus-not-created')) {
      this.setState({
        submitting: false,
        error: serverError
      })
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

  renderFormGroup (name, label = name, type = 'text', autoFocus = false) {
    const { intl: { formatMessage } } = this.props
    return (
      <div className="form-group">
        <label><T id={ label } /></label>
        <input
          disabled={ this.state.submitting }
          autoFocus={ autoFocus }
          name={ name }
          placeholder={ formatMessage({ id: label }) }
          onChange={ ({ target }) => this.setDataState(name, target.value) }
          type={ type }
          value={ this.state.data[name] || '' }
        />
      </div>
    )
  }

  getInitData (props) {
    const { location } = props
    return {
      name: location.state && location.state.filterName,
      password: null,
      passwordConfirm: null
    }
  }

  onSubmit = (evt) => {
    // no real submit to the server
    evt.preventDefault()
    const newState = {
      submitting: true,
      error: null
    }

    if (!this.isValid()) {
      newState.submitting = false
      newState.error = { messageId:'error.password-mismatch' }
      newState.data = {
        ...this.state.data,
        password: '',
        passwordConfirm: ''
      }
      return this.setState(newState)
    }
    this.setState(newState)

    const corpus = this.cleanData()
    this.props.createCorpus({
      server: this.props.server,
      corpus,
      options: {
        depthHypheBro: this.state.crawlDepth,
        defaultCreationRule: this.state.creationRule
      }
    })
  }

  cleanData () {
    const corpus = {
      ...this.state.data
    }
    delete corpus.passwordConfirm
    if (!corpus.name) delete corpus.name
    if (!corpus.password) delete corpus.password
    return corpus
  }

  isValid () {
    return this.state.data.password === this.state.data.passwordConfirm
  }

  render () {
    const { error, passwordProtected, advancedOptions, creationRule, crawlDepth, serverStatus } = this.state
    const maxDepth = serverStatus && serverStatus.hyphe && serverStatus.hyphe.max_depth || 3
    const depths = [ ...Array(maxDepth).keys() ].map(i => i+1)

    const onTogglePasswordProtected = () => {
      let newState = {
        passwordProtected: !passwordProtected
      }
      // if disabling password protected clear the password
      if (passwordProtected) {
        newState = {
          ...newState,
          password: '',
          passwordConfirm: ''
        }
      }
      this.setState(newState)
    }
    return (
      <form className="corpus-form" onSubmit={ this.onSubmit }>
        <h3 className="section-header">
          <T id="create-a-corpus" />
        </h3>
        { error &&
          <div className="form-error"><T id={ error.messageId } values={ error.messageValues || {} } /></div>
        }

        <div className="config-form">
          { this.state.submitting ?
            <h5>{this.state.data.name}</h5>
            :
            this.renderFormGroup('name', 'corpus-name', 'text', true)
          }
          <div className={ cx('options-wrapper', { active: passwordProtected }) }>
            {
              !this.state.submitting &&
              <div onClick={ onTogglePasswordProtected } className="form-group horizontal">
                <input readOnly checked={ passwordProtected } type="radio" />
                <label><T id="password-protected-creation" /></label>
              </div>
            }

            { passwordProtected && this.renderFormGroup('password', 'password', 'password') }
            { passwordProtected && this.renderFormGroup('passwordConfirm', 'confirm-password', 'password') }
          </div>
          <div className={ cx('options-wrapper', { active: advancedOptions }) }>
            {!this.state.submitting &&
              <div onClick={ () => this.setState({ advancedOptions: !advancedOptions }) } className="form-group horizontal">
                <input readOnly checked={ advancedOptions } type="radio" />
                <label><T id="advanced-creation-options" /></label>
              </div>
            }
            {advancedOptions &&
            <>
              <div className="form-group">
                <label><T id="depth-creation" />
                  <HelpPin place="top">
                    <T id="depth-creation-help" />
                  </HelpPin>
                </label>
                {
                  depths.map((depth, index) => (
                    <div
                      key={ index }
                      className="form-group horizontal minified"
                      onClick={ () => this.setState({ crawlDepth: depth }) }
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
                    <T id="default-creation-rule-help" />
                  </HelpPin>

                </label>
                {
                  creationRules.map((rule, index) => (
                    <div
                      key={ index }
                      className="form-group horizontal minified"
                      onClick={ () => this.setState({ creationRule: rule }) }
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

        { this.state.submitting
          ? <Spinner />
          : (
            <div className="buttons-row">
              <li>
                <Link className="btn btn-error" to="/login"><T id="cancel" /></Link>
              </li>
              <li className="main-button-container">
                <button className={ cx('btn btn-primary', { 'is-disabled': !this.state.data.name }) } disabled={ this.state.submitting }>
                  <T id="create-corpus" />
                </button>
              </li>
            </div>
          )
        }
      </form>
    )
  }
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

export default injectIntl(ConnectedCorpusForm)
