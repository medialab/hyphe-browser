// first login form seen by the user when starting the app

import '../../css/pane'
import '../../css/login/start-up-form'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import actions from './../../actions'
import CorpusList from './CorpusList'

import { FormattedMessage as T } from 'react-intl'


const StartUpForm = (props, context) => {
  const formatMessage = context.intl.formatMessage

  return (
    <form className="start-up-form">
      <h2 className="pane-centered-title"><T id="welcome" /></h2>

      <div className="form-group">
        <select
          className="form-control server-list"
          onChange={ (evt) => { if (evt.target.value) props.actions.fetchCorpora(evt.target.value) } }
        >
          <option value="">{ formatMessage({ id: 'select-server' }) }</option>
          { props.servers.map((server) =>
            <option key={ server.url } value={ server.url }>{ server.name }</option>
          ) }
        </select>
      </div>
      <div className="form-group">
        <Link className="btn btn-primary" to="/login/server-form"><T id="add-server" /></Link>
      </div>

      <hr />

      { props.ui.loaders.corpora
        ? <span><T id="loading-corpora" /></span>
        : <CorpusList actions={ props.actions } corpora={ props.corpora } />
      }
    </form>
  )

}

StartUpForm.contextTypes = {
  intl: PropTypes.any
}

StartUpForm.propTypes = {
  corpora: PropTypes.object.isRequired,
  servers: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  corpora: state.corpora.list,
  servers: state.servers.list,
  ui: state.ui
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

const connectedStartUpForm = connect(mapStateToProps, mapDispatchToProps)(StartUpForm)

export default connectedStartUpForm
