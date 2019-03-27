// creation form of a corpus

// local validation errors :
// - password must equals passwordConfirm

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { FormattedMessage as T } from 'react-intl'

import { createCorpus } from '../../actions/corpora'
import { ERROR_SERVER_NO_RESOURCE } from '../../constants'
import Spinner from '../Spinner'

class CorpusForm extends React.Component {

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

  renderFormGroup (name, label = name, type = 'text', autoFocus = false) {
    return (
      <div className="form-group">
        <label><T id={ label } /></label>
        <input disabled={ this.state.submitting }
               autoFocus={ autoFocus }
               name={ name }
               onChange={ ({ target }) => this.setDataState(name, target.value) }
               type={ type }
               value={ this.state.data[name] || '' } />
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

  onSubmit (evt) {
    // no real submit to the server
    evt.preventDefault()
    const newState = {
      submitting: true,
      errors: []
    }

    if (!this.isValid()) {
      newState.submitting = false
      newState.errors = ['error.password-mismatch']
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
    let corpus = {
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

  componentWillReceiveProps ({ serverError }) {
    if (serverError && serverError.id === ERROR_SERVER_NO_RESOURCE) {
      this.setState({
        submitting: false,
        errors: ['error.corpus-not-created-no-resource']
      })
    }
  }

  render () {
    return (
      <form className="corpus-form" onSubmit={ (evt) => this.onSubmit(evt) }>
        { this.state.errors.map((error) =>
          <div className="form-error" key={ error }><T id={ error } /></div>
        ) }

        { this.renderFormGroup('name', 'corpus-name', 'text', true) }
        { this.renderFormGroup('password', 'password', 'password') }
        { this.renderFormGroup('passwordConfirm', 'confirm-password', 'password') }

        { this.state.submitting
          ? <Spinner />
          : (
            <div className="form-actions">
              <button className="btn btn-primary" disabled={ this.state.submitting }>
                <T id="create-corpus" />
              </button>
              <Link className="btn btn-default" to="/login"><T id="cancel" /></Link>
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

const mapStateToProps = ({ servers, intl: { locale }, ui }) => ({
  locale,
  server: servers.selected,
  serverError: ui.error
})

const ConnectedCorpusForm = connect(mapStateToProps, {
  createCorpus
})(CorpusForm)

export default ConnectedCorpusForm
