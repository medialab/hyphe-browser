// login to a corpus form

import React, { PropTypes } from 'react'
import { corpusShape } from '../../types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { routeActions } from 'react-router-redux'
import { FormattedMessage as T } from 'react-intl'

import * as actions from '../../actions/corpora'
import jsonrpc from '../../utils/jsonrpc'

class CorpusLoginForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      submitting: false,
      errors: [],
      password: null
    }
  }

  onSubmit (evt) {
    evt.preventDefault()

    this.setState({ submitting: true })
    jsonrpc(this.props.server.url)('start_corpus', [this.props.corpus.get('corpus_id'), this.state.password])
      .then(() => {
        this.props.dispatch(routeActions.push('/browser'))
      }, () => {
        this.setState({ submitting: false, errors: ['error.wrong-password'] })
      })

  }

  render () {
    return (
      <form className="server-form" onSubmit={ (evt) => { this.onSubmit(evt) } }>
        <h2 className="pane-centered-title"><T id="login-corpus" values={ { name: this.props.corpus.get('name') } } /></h2>

        { this.state.errors.map((error) =>
          <div className="form-error" key={ error }><T id={ error } /></div>
        ) }

        <hr />

        <div className="form-group">
          <label><T id="password" /></label>
          <input type="password" className="form-control" onChange={ (evt) => this.setState({ password: evt.target.value }) }/>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={ this.state.submitting }>
            <T id="connect" />
          </button>
          <Link className="btn btn-default" to="/login"><T id="cancel" /></Link>
        </div>
      </form>
    )
  }
}

CorpusLoginForm.propTypes = {
  actions: PropTypes.object.isRequired,
  corpus: corpusShape,
  dispatch: PropTypes.func,
  server: PropTypes.object
}

const mapStateToProps = (state) => ({
  corpus: state.corpora.get('selected'),
  server: state.servers.selected
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  dispatch
})

const ConnectedCorpusLoginForm = connect(mapStateToProps, mapDispatchToProps)(CorpusLoginForm)

export default ConnectedCorpusLoginForm
