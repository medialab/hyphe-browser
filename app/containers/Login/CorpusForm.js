// creation form of a corpus

// local validation errors :
// - password must equals passwordConfirm

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage as T } from 'react-intl'

import { createCorpus } from '../../actions/corpora'
import Spinner from '../../components/Spinner'

class CorpusForm extends React.Component {

  // generic form methods

  constructor (props) {
    super(props)
    this.state = {
      submitting: false,
      error: null,
      data: this.getInitData(),
      passwordProtected: false,
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
    const {intl: {formatMessage}} = this.context
    return (
      <div className="form-group">
        <label><T id={ label } /></label>
        <input
          disabled={ this.state.submitting }
          autoFocus={ autoFocus }
          name={ name }
          placeholder={formatMessage({id: label})}
          onChange={ ({ target }) => this.setDataState(name, target.value) }
          type={ type }
          value={ this.state.data[name] || '' }
        />
      </div>
    )
  }

  getInitData () {
    return {
      name: null,
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
    this.props.createCorpus(this.props.server, corpus)
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
    const { error, passwordProtected } = this.state

    const onTogglePasswordProtected = () => {
      console.log('on toggle password protected')
      this.setState({
        passwordProtected: !passwordProtected
      })
    }
    return (
      <form className="corpus-form" onSubmit={ this.onSubmit }>
        <h3 className="section-header">
          <T id="create-a-corpus" />
        </h3>
        { error && 
          <div className="form-error"><T id={ error.messageId } values={ error.messageValues || {} } /></div>
        }

        { this.renderFormGroup('name', 'corpus-name', 'text', true) }
        <div onClick={onTogglePasswordProtected} className="form-group horizontal">
          <input readOnly checked={passwordProtected} type="radio"/>
          <label><T id="password-protected" /></label>
        </div>
        { passwordProtected && this.renderFormGroup('password', 'password', 'password') }
        { passwordProtected && this.renderFormGroup('passwordConfirm', 'confirm-password', 'password') }

        { this.state.submitting
          ? <Spinner />
          : (
            <div className="buttons-row">
              <li>
              <Link className="btn btn-error" to="/login"><T id="cancel" /></Link>
              </li>
              <li>
              <button className="btn btn-primary" disabled={ this.state.submitting }>
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

CorpusForm.contextTypes = {
  intl: PropTypes.object
}

const mapStateToProps = ({ servers, intl: { locale }, ui }) => ({
  locale,
  server: servers.selected,
  serverError: ui.notification
})

const ConnectedCorpusForm = connect(mapStateToProps, {
  createCorpus
})(CorpusForm)

export default ConnectedCorpusForm
