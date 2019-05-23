// login to a corpus form

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage as T } from 'react-intl'

import { selectCorpus } from '../../actions/corpora'
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

  onSubmit = (evt) => {
    const { server, corpus, selectCorpus, routerPush } = this.props
    evt.preventDefault()

    this.setState({ submitting: true })
    jsonrpc(server.url)('start_corpus', [corpus.corpus_id, this.state.password])
      .then(() => {
        this.setState({ submitting: false })
        selectCorpus(server, corpus)
        routerPush('/browser')
      }, () => {
        this.setState({ submitting: false, errors: ['error.wrong-password'] })
      })
  }

  render () {
    return (
      <form className="server-form" onSubmit={ this.onSubmit }>
        <h3 className="pane-centered-title">
          <T id="login-corpus" values={ { name: this.props.corpus.name } } />
        </h3>

        { this.state.errors.map((error) =>
          <div className="form-error" key={ error }><T id={ error } /></div>
        ) }

        <div className="form-group">
          <label><T id="password" /></label>
          <input autoFocus type="password" onChange={ (evt) => this.setState({ password: evt.target.value }) } />
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
  corpus: PropTypes.object,
  locale: PropTypes.string.isRequired,
  server: PropTypes.object,

  // action
  routerPush: PropTypes.func,
  selectCorpus: PropTypes.func,
}

const mapStateToProps = ({ corpora, intl: { locale }, servers }) => ({
  corpus: corpora.selected,
  locale,
  server: servers.selected,
})

export default connect(mapStateToProps, {
  routerPush: routerActions.push,
  selectCorpus
})(CorpusLoginForm)

