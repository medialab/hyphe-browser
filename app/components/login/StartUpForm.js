// first login form seen by the user when starting the app

import '../../css/pane'
import '../../css/login/start-up-form'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as actions from './../../actions/servers'
import CorpusList from './CorpusList'

const StartUpForm = (props) => {

  return (
    <form className="start-up-form">
      <h2 className="pane-centered-title">Welcome to Hyphe</h2>

      <div className="form-group">
        <select
          className="form-control server-list"
          onChange={ (evt) => props.actions.fetchCorpora(evt.target.value) }
        >
          <option>Please select a server instance</option>
          { props.servers.map((server) =>
            <option key={ server.url } value={ server.url }>{ server.name }</option>
          ) }
        </select>
      </div>
      <div className="form-group">
        <Link className="btn btn-primary" to="/login/server-form">Add server</Link>
      </div>

      <hr />

      { props.ui.loaders.corpora
        ? <span>Loading corpora…</span>
        : <CorpusList corpora={ props.corpora } />
      }
    </form>
  )

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
