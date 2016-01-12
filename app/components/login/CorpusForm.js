// creation form of a corpus

import '../../css/login/corpus-form'

import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { FormattedMessage as T } from 'react-intl'

import * as actions from '../../actions/corpora'

class CorpusForm extends Component {

  constructor (props) {
    super(props)
    this.state = this.getInitState()
  }

  onSubmit (evt) {
    // no real submit to the server
    evt.preventDefault()
    this.setFormState('disabled', true)

    if (!this.checkPassword()) {
      this.setFormState('disabled', false)
      this.setDataState('password', '')
      this.setDataState('passwordConfirm', '')
      // TODO error message
      console.error('passwords must match')
      return
    }

    let corpus = {
      ...this.state.data
    }

    // clean unused info
    delete corpus.passwordConfirm
    if (!corpus.name) delete corpus.name
    if (!corpus.password) delete corpus.password

    this.props.actions.createCorpus(this.props.server.url, corpus)
  }

  onChangeName (evt) {
    this.setDataState('name', evt.target.value)
  }

  onChangePassword (evt) {
    this.setDataState('password', evt.target.value)
  }

  onChangePasswordConfirm (evt) {
    this.setDataState('passwordConfirm', evt.target.value)
  }

  checkPassword () {
    return this.state.data.password === this.state.data.passwordConfirm
  }

  getInitState () {
    return {
      // form state
      disabled: false,
      errors: [],
      // fields values
      data: {
        name: null,
        password: null,
        passwordConfirm: null
      }
    }
  }

  // proxy for setState
  setFormState (key, value) {
    let state = {
      ...this.state,
      [key]: value
    }
    this.setState(state)
  }

  // deal with fields values
  setDataState (key, value) {
    let data = {
      ...this.state.data,
      [key]: value
    }
    this.setFormState('data', data)
  }

  render () {
    const { server } = this.props

    return (
      <form className="server-form" onSubmit={ (evt) => this.onSubmit(evt) }>
        <h2 className="pane-centered-title"><T id="corpus-edition" /></h2>
        <div><T id="on-server" values={ server } /></div>
        <hr />
        <div className="form-group">
          <label><T id="corpus-name" /></label>
          <input className="form-control"
                 onChange={ (evt) => this.onChangeName(evt) }
                 value={ this.state.data.name } />
        </div>
        <div className="form-group">
          <label><T id="password" /></label>
          <input className="form-control"
                 onChange={ (evt) => this.onChangePassword(evt) }
                 value={ this.state.data.password } />
        </div>
        <div className="form-group">
          <label><T id="confirm-password" /></label>
          <input className="form-control"
                 onChange={ (evt) => this.onChangePasswordConfirm(evt) }
                 value={ this.state.data.passwordConfirm } />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={ this.state.disabled }><T id="create-corpus" /></button>
          <Link className="btn btn-default" to="/login"><T id="cancel" /></Link>
        </div>
      </form>
    )
  }
}

CorpusForm.propTypes = {
  actions: PropTypes.object,
  server: PropTypes.object
}

const mapStateToProps = (state) => ({
  server: state.servers.selected
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

const ConnectedCorpusForm = connect(mapStateToProps, mapDispatchToProps)(CorpusForm)

export default ConnectedCorpusForm
