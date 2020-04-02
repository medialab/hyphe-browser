import './login.styl'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage as T, injectIntl } from 'react-intl'

import { fetchCorpora, fetchServerStatus } from '../../actions/corpora'
import { deselectServer, deleteServer } from '../../actions/servers'

import LogoTitle from '../../components/LogoTitle'
import ServerSelect from '../../components/ServerSelect'


class Login extends React.Component {
  componentDidMount () {
    this.refreshStatusAndCorpora()
  }

  componentWillReceiveProps ({ selectedServer }) {
    if ((selectedServer !== this.props.selectedServer) && selectedServer && selectedServer.url) {
      this.refreshStatusAndCorpora(selectedServer.url)
    }
  }

  refreshStatusAndCorpora (url) {
    const { fetchCorpora, fetchServerStatus, deselectServer, history } = this.props
    const { push: routerPush } = history
    if (url === 'add') {
      deselectServer()
      routerPush('/login/server-form')
      return
    }

    if (url) {
      fetchServerStatus(url)
        .then(({ payload }) => {
          if (!payload.error) return fetchCorpora(url)
        })
    }
  }

  renderServerSelect () {
    const { selectedServer, servers, location } = this.props
    const { formatMessage } = this.props.intl

    const options = servers.map((s) => ({
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
        autoFocus
        value = { selectedServer ? selectedServer.url : '' }
        disabled={ location.pathname !== '/login' }
        onChange={ (evt) => { if (evt.target.value) this.refreshStatusAndCorpora(evt.target.value) } }
      >
        { options.map((o) => <option key={ o.key + o.label } value={ o.value }>{ o.label }</option>) }
      </select>
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
          <div className="config-container">
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
                  onChange={ url => this.refreshStatusAndCorpora(url) }
                  onEdit={ handleEditServer }
                  onForget={ handleForget }
                />
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
  deselectServer,
  fetchCorpora,
  fetchServerStatus,
  deleteServer,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Login))
