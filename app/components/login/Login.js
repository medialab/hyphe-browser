import '../../css/pane'
import '../../css/login/login'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import { routerActions } from 'react-router-redux'

import { fetchCorpora, fetchServerStatus } from '../../actions/corpora'
import { deselectServer } from '../../actions/servers'
import HypheHeader from '../HypheHeader'
import HypheFooter from '../HypheFooter'

class Login extends React.Component {
  componentDidMount () {
    this.refreshStatusAndCorpora()
  }

  refreshStatusAndCorpora (url) {
    const { selectedServer, fetchCorpora, fetchServerStatus, deselectServer, routerPush } = this.props
    if (url === 'add') {
      deselectServer()
      routerPush('/login/server-form')
      return
    }
    url = url || selectedServer && selectedServer.url

    if (url) {
      fetchCorpora(url)
      fetchServerStatus(url)
    }
  }

  renderServerSelect () {
    const { selectedServer, servers, location } = this.props
    const { formatMessage } = this.context.intl

    let options = servers.map((s) => ({
      label: `${s.name} (${s.url})`,
      value: s.url,
      key: s.url
    }))

    // add default option only when no server selected
    if (!selectedServer || !selectedServer.url) {
      options.unshift({
        label: formatMessage({ id: 'select-server' }),
        value: '',
        key: 'default'
      })
    }

    options.push({
      label: formatMessage({ id: 'server-add' }),
      value: 'add',
      key: 'server-add'
    })

    return (
      <select
        className="form-control server-list"
        defaultValue={ selectedServer && selectedServer.url }
        disabled={ location.pathname !== '/login' }
        onChange={ (evt) => { if (evt.target.value) this.refreshStatusAndCorpora(evt.target.value) } }
      >
        { options.map((o) => <option key={ o.key } value={ o.value }>{ o.label }</option>) }
      </select>
    )
  }

  render () {
    const { selectedServer, location } = this.props

    return (
      <div className="window">
        <HypheHeader />
        <div className="window-content">
          <div className="pane-centered">

            <h2 className="pane-centered-title"><T id="welcome" /></h2>
            <main className="pane-centered-main">
              <div className="form-group inline">
                { this.renderServerSelect() }
                { selectedServer && location.pathname === '/login' && <Link className="btn btn-default" to="/login/server-form?edit">
                    <span className="ti-pencil"></span></Link> }
              </div>
            { this.props.children  }
            </main>

          </div>
        </div>
        <HypheFooter />
      </div>
    )
  }
}

Login.contextTypes = {
  intl: intlShape
}

Login.propTypes = {
  children: PropTypes.node,
  selectedServer: PropTypes.object,
  servers: PropTypes.array.isRequired,
  // router
  pathname: PropTypes.string,

  // actions
  fetchCorpora: PropTypes.func,
  fetchServerStatus: PropTypes.func,
  deselectServer: PropTypes.func,
  routerPush: PropTypes.func
}

// router infos are given in ownProps
const mapStateToProps = (state) => ({
  selectedServer: state.servers.selected,
  servers: state.servers.list
})

const mapDispatchToProps = {
  fetchCorpora,
  fetchServerStatus,
  deselectServer,
  routerPush: routerActions.push
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
