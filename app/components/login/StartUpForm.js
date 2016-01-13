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

// the reset button is for dev purposes and should be put somewhere else in the final product

class StartUpForm extends React.Component {
  render () {
    const { selectedServer, actions, servers, ui, corpora, dispatch } = this.props

    return (
      <form className="start-up-form" onSubmit={ (evt) => evt.preventDefault() }>
        <h2 className="pane-centered-title"><T id="welcome" /></h2>

        <div className="form-group">
          <select
            className="form-control server-list"
            defaultValue={ selectedServer && selectedServer.url }
            onChange={ (evt) => { if (evt.target.value) actions.fetchCorpora(evt.target.value) } }
          >
            <option value="">{ context.intl.formatMessage({ id: 'select-server' }) }</option>
            { servers.map((server) =>
              <option key={ server.url } value={ server.url }>
                { server.name } ({ server.url })
              </option>
            ) }
          </select>
        </div>
        <div className="form-group">
          <Link className="btn btn-primary" to="/login/server-form"><T id="add-server" /></Link>
          { selectedServer
            ? <Link className="btn btn-primary" to="/login/server-form?edit"><T id="edit-server" /></Link>
            : null
          }
          <button className="btn btn-default" onClick={ () => actions.resetServers() }>
            <T id="reset-servers" />
          </button>
        </div>

        { ui.error === true
          ? <div className="form-error"><T id="error-loading-corpora" /></div>
          : null
        }

        { ui.loaders.corpora
          ? <Spinner textId="loading-corpora" />
          : <CorpusList actions={ actions } corpora={ corpora } dispatch={ dispatch } />
        }
      </form>
    )
  }
}

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
