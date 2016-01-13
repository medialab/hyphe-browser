// login to a corpus form

import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { FormattedMessage as T } from 'react-intl'

import * as actions from '../../actions/corpora'

class CorpusLoginForm extends React.Component {
  render () {
    return (
      <form className="server-form">
        <h2 className="pane-centered-title"><T id="login-corpus" values={ { name: this.props.corpus.name } } /></h2>
        <div className="form-group">
          <label><T id="password" /></label>
          <input className="form-control" />
        </div>
        <div className="form-actions">
          <Link className="btn btn-primary" to="/browser"><T id="connect" /></Link>
          <Link className="btn btn-default" to="/login"><T id="cancel" /></Link>
        </div>
      </form>
    )
  }
}

CorpusLoginForm.propTypes = {
  actions: PropTypes.object.isRequired,
  corpus: PropTypes.object
}

const mapStateToProps = (state) => ({
  corpus: state.corpora.selected
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

const ConnectedCorpusLoginForm = connect(mapStateToProps, mapDispatchToProps)(CorpusLoginForm)

export default ConnectedCorpusLoginForm
