// displayed when a server is selected

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Link from '../../components/Link'
import { FormattedMessage as T, injectIntl } from 'react-intl'

const ServerSumup = props => {
  const { server } = props

  if (!server) return null

  let status, actionDisabled = true, action = 'stop'
  if (server.cloud) {
    const { deployed, installed, running } = server.cloud

    if (deployed && installed && running) {
      status = 'ok'
      actionDisabled = false
    }
    else if (deployed && installed) {
      status = 'stopped'
      actionDisabled = false
      action = 'start'
    }
    else if (deployed) status = 'installing'
    else status = 'deploying'
  }

  return (
    <div className="server-sumup-container">
      <div>
        <p className="server-sumup-label"><T id="server-api-url" /></p>
        <p className="server-sumup-value">
          <i className="ti-link" />
          <Link url={ server.url }>
            { server.url }
          </Link>
        </p>
      </div>
      <div>
        <p className="server-sumup-label"><T id="server-gui-url" /></p>
        <p className="server-sumup-value">
          <i className="ti-link" />
          <Link url={ server.home }>
            { server.home }
          </Link>
        </p>
      </div>
      {
        server.cloud &&
        <div>
          <p className="server-sumup-label"><T id="server-status" /></p>
          <p className="server-sumup-value server-sumup-action">
            <span>
              <T id={ 'server-status-' + status } />
            </span>
            {
              // TODO:
              // Plug actual actions
              false &&
              <button className="btn btn-primary" disabled={ actionDisabled }>
                <T id={ 'server-' + action } />
              </button>
            }
          </p>
        </div>
      }
    </div>
  )
}

ServerSumup.propTypes = {
  locale: PropTypes.string.isRequired,
  server: PropTypes.object,

  // actions
  // TODO
}

const mapStateToProps = ({ servers, intl: { locale } }) => ({
  locale,
  server: servers.selected
})

export default injectIntl(connect(mapStateToProps, {
  // TODO: Add actions
})(ServerSumup))
