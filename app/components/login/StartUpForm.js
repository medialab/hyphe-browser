// first login form seen by the user when starting the app

import '../../css/pane'
import '../../css/login/start-up-form'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'

import actions from '../../actions'
import CorpusList from './CorpusList'
import Spinner from '../Spinner'

const StartUpForm = (props, context) => (
  <form className="start-up-form">
    <h2 className="pane-centered-title"><T id="welcome" /></h2>

    <div className="form-group">
      <select
        className="form-control server-list"
        defaultValue={ props.selectedServer && props.selectedServer.url }
        onChange={ (evt) => { if (evt.target.value) props.actions.fetchCorpora(evt.target.value) } }
      >
        <option value="">{ context.intl.formatMessage({ id: 'select-server' }) }</option>
        { props.servers.map((server) =>
          <option key={ server.url } value={ server.url }>{ server.name }</option>
        ) }
      </select>
    </div>
    <div className="form-group">
      <Link className="btn btn-primary" to="/login/server-form"><T id="add-server" /></Link>
    </div>

    { props.ui.loaders.corpora
      ? <Spinner textId="loading-corpora" />
      : <CorpusList actions={ props.actions } corpora={ props.corpora } dispatch={ props.dispatch } />
    }
  </form>
)

StartUpForm.contextTypes = {
  intl: intlShape
}

StartUpForm.propTypes = {
  actions: PropTypes.object,
  corpora: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
  selectedServer: PropTypes.object,
  servers: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  corpora: state.corpora.list,
  selectedServer: state.servers.selected,
  servers: state.servers.list,
  ui: state.ui
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  dispatch
})

const connectedStartUpForm = connect(mapStateToProps, mapDispatchToProps)(StartUpForm)

export default connectedStartUpForm
