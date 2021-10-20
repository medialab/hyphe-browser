import './login.styl'

import React from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage as T, injectIntl } from 'react-intl'

import { fetchCorpora, fetchServerStatus } from '../../actions/corpora'
import { selectServer, deselectServer, deleteServer, fetchCloudServerStatus } from '../../actions/servers'

import LogoTitle from '../../components/LogoTitle'
import ServerSelect from '../../components/ServerSelect'
import ServerSumup from './ServerSumup'

class Login extends React.Component {
  componentDidMount () {
    if (this.props.selectedServer) {
      this.selectOption(this.props.selectedServer.url, true)
    }
  }

  selectOption (url, force) {
    if (!force && url === (this.props.selectedServer || {}).url) return

    const {
      fetchCorpora, fetchServerStatus, fetchCloudServerStatus,
      selectServer, deselectServer, history
    } = this.props
    const { push: routerPush } = history

    if (url === 'add') {
      deselectServer()
      routerPush('/login/server-form')
      return
    }

    const server = this.props.servers.find(data => data.url === url)

    if (!url || !server) return

    selectServer(server)

    if (server.cloud && server.cloud.installed) {
      fetchCloudServerStatus(server)
        .then(() => fetchServerStatus(url))
        .then(({ payload }) => {
          if (!payload.error) return fetchCorpora(url)
        })
    } else {
      fetchServerStatus(url)
        .then(({ payload }) => {
          if (!payload.error) return fetchCorpora(url)
        })
    }
  }

  isLarge () {
    const { selectedServer } = this.props
    return (
      (selectedServer && selectedServer.cloud && !selectedServer.cloud.installed)
    )
  }

  render () {
    const {
      selectedServer,
      location,
      servers,
      history,
      deleteServer
    } = this.props
    // hide grey background?
    // const naked = !selectedServer && !location.pathname.includes('server-form')

    const handleEditServer = () => {
      // selectedServer && location.pathname === '/login' && <Link className="btn" to="/login/server-form?edit"
      if (selectedServer && location.pathname === '/login') {
        history.push('/login/server-form?edit')
      }
    }

    const handleForget = () => {
      deleteServer(selectedServer)
      this.props.history.push('/login')
    }

    return (
      <div className="login">
        <main className="login-container">
          <LogoTitle />
          <div className={ cx('config-container', this.isLarge() && 'large') }>
            {
              location.pathname === '/login' &&
              <div className="server-container">
                <h3 className="section-header"><T id="choose-hyphe-server" /></h3>
                <ServerSelect
                  { ...{
                    selectedServer,
                    servers,
                    location,
                  } }
                  isDisabled={ location.pathname !== '/login' }
                  onChange={ url => this.selectOption(url) }
                  onEdit={ handleEditServer }
                  onForget={ handleForget }
                />
                <ServerSumup />
              </div>
            }

            { this.props.children}
          </div>
        </main>
      </div>
    )
  }
}

Login.propTypes = {
  children: PropTypes.node,
  selectedServer: PropTypes.object,
  servers: PropTypes.array.isRequired,

  // router
  location: PropTypes.object,
  history: PropTypes.object,

  // actions
  selectServer: PropTypes.func,
  deselectServer: PropTypes.func,
  fetchCorpora: PropTypes.func,
  fetchServerStatus: PropTypes.func,
  deleteServer: PropTypes.func,
}

// router infos are given in ownProps
const mapStateToProps = ({ servers, intl: { locale } }) => ({
  selectedServer: servers.selected,
  servers: servers.list,
  locale
})

const mapDispatchToProps = {
  selectServer,
  deselectServer,
  fetchCorpora,
  fetchServerStatus,
  fetchCloudServerStatus,
  deleteServer,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Login))
