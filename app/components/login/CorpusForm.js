// creation form of a corpus

// local validation errors :
// - password must equals passwordConfirm

import '../../css/login/corpus-form'

import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { FormattedMessage as T } from 'react-intl'

import * as actions from '../../actions/corpora'
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
      newState.errors = ['password-mismatch']
      newState.data = {
        ...this.state.data,
        password: '',
        passwordConfirm: ''
      }
      return this.setState(newState)
    }
    this.setState(newState)

    const corpus = this.cleanData()
    this.props.actions.createCorpus(this.props.server.url, corpus)
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
        errors: ['corpus-not-created-no-resource']
      })
    }
  }

  render () {
    const { server } = this.props

    return (
      <form className="corpus-form" onSubmit={ (evt) => this.onSubmit(evt) }>
        <h2 className="pane-centered-title"><T id="corpus-edition" /></h2>
        <div><T id="on-server" values={ server } /></div>

        { this.state.errors.map((error) =>
          <div className="form-error" key={ error }><T id={ error } /></div>
        ) }

        <hr />

        { this.renderFormGroup('name', 'corpus-name') }
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
  actions: PropTypes.object,
  server: PropTypes.object,
  serverError: PropTypes.object
}

const mapStateToProps = (state) => ({
  server: state.servers.selected,
  serverError: state.ui.error
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

const ConnectedCorpusForm = connect(mapStateToProps, mapDispatchToProps)(CorpusForm)

export default ConnectedCorpusForm
