import '../../css/login/login'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import { routerActions } from 'react-router-redux'
import cx from 'classnames'

import { fetchCorpora, fetchServerStatus } from '../../actions/corpora'
import { deselectServer } from '../../actions/servers'
import Footer from '../../components/Footer'

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
        autoFocus
        value = { selectedServer && selectedServer.url }
        disabled={ location.pathname !== '/login' }
        onChange={ (evt) => { if (evt.target.value) this.refreshStatusAndCorpora(evt.target.value) } }>
        { options.map((o) => <option key={ o.key + o.label } value={ o.value }>{ o.label }</option>) }
      </select>
    )
  }

  render () {
    const { selectedServer, location } = this.props
    // hide grey background?
    const naked = !selectedServer && !location.pathname.includes('server-form')

    return (
      <div className="window">
        <div className="pane-centered">
          <h2 className="pane-centered-title"><T id="welcome" /></h2>
          <main className={ cx('pane-centered-main', { naked }) }>
          <div className="form-group server-list">
            { this.renderServerSelect() }
            { selectedServer && location.pathname === '/login' && <Link className="btn" to="/login/server-form?edit">
                <span className="ti-pencil"></span></Link> }
          </div>
          { this.props.children }
          </main>
        </div>
        <Footer />
      </div>
    )
  }
}

Login.contextTypes = {
  intl: intlShape,
}

Login.propTypes = {
  children: PropTypes.node,
  selectedServer: PropTypes.object,
  servers: PropTypes.array.isRequired,

  // router
  location: PropTypes.object,

  // actions
  deselectServer: PropTypes.func,
  fetchCorpora: PropTypes.func,
  fetchServerStatus: PropTypes.func,
  routerPush: PropTypes.func
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
  routerPush: routerActions.push
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
