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
import Button from '../Button'

class StartUpForm extends React.Component {

  componentDidMount () {
    this.refreshStatusAndCorpora()
  }

  refreshStatusAndCorpora (url) {
    const { selectedServer, actions } = this.props
    url = url || selectedServer && selectedServer.url

    if (url) {
      actions.fetchCorpora(url)
      actions.fetchServerStatus(url)
    }
  }

  renderServerSelect () {
    const { selectedServer, servers } = this.props

    let options = servers.map((s) => ({
      label: `${s.name} (${s.url})`,
      value: s.url,
      key: s.url
    }))

    // add default option only when no server selected
    if (!selectedServer || !selectedServer.url) {
      options = [{
        label: this.context.intl.formatMessage({ id: 'select-server' }),
        value: '',
        key: 'default'
      }].concat(options)
    }

    return (
      <select
        className="form-control server-list"
        defaultValue={ selectedServer && selectedServer.url }
        onChange={ (evt) => { if (evt.target.value) this.refreshStatusAndCorpora(evt.target.value) } }
      >
        { options.map((o) => <option key={ o.key } value={ o.value }>{ o.label }</option>) }
      </select>
    )
  }

  render () {
    const { actions, dispatch, corpora, status, selectedServer, ui } = this.props

    return (
      <form className="start-up-form" onSubmit={ (evt) => evt.preventDefault() }>
        <h2 className="pane-centered-title">
          <T id="welcome" />
          <Link className="options-link" to="/login/options">
            <span className="icon icon-cog"></span>
          </Link>
        </h2>

        <div className="form-group inline">
          { this.renderServerSelect() }
          <Button icon="play" onClick={ () => { this.refreshStatusAndCorpora() } } />
        </div>
        <div className="form-actions">
          <Link className="btn btn-primary" to="/login/server-form"><T id="add-server" /></Link>
          { selectedServer
            ? <Link className="btn btn-default" to="/login/server-form?edit"><T id="edit-server" /></Link>
            : null
          }
        </div>

        { ui.error === true
          ? <div className="form-error"><T id="error.loading-corpora" /></div>
          : null
        }

        { ui.loaders.corpora
          ? <Spinner textId="loading-corpora" />
          : (selectedServer
            ? <CorpusList actions={ actions } dispatch={ dispatch }
                corpora={ corpora } status={ status && status.hyphe }
                server={ selectedServer } />
            : <noscript />
          )
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
  status: PropTypes.object,
  ui: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  corpora: state.corpora.list,
  selectedServer: state.servers.selected,
  servers: state.servers.list,
  status: state.corpora.status,
  ui: state.ui
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  dispatch
})

const connectedStartUpForm = connect(mapStateToProps, mapDispatchToProps)(StartUpForm)

export default connectedStartUpForm
