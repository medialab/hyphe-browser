import cx from 'classnames'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import React, { useState } from 'react'

import Ellipsis from '../Ellipsis'
import { useRetry } from '../../utils/hooks'
import { isInstalledPromise } from '../../utils/cloud-helpers'
import { updateServer } from '../../actions/servers'
import { fetchCorpora, fetchServerStatus } from '../../actions/corpora'

import './SelectedServerLogs.styl'

/**
 * This component monitors selected cloud server's installation, and once it's
 * fully installed, set it as `installed` and load corpora.
 *
 * It will display an error message if there is no selected server or if it is
 * not a cloud server (ie. installed from this HypheBrowser instance).
 *
 * TODO:
 * *****
 * Move the impactful actions calls into actual actions, to make it so that it
 * does not require this component to finalize a cloud server installation in
 * the app state.
 */
const SelectedServerLogs = ({ server, updateServer, fetchCorpora, fetchServerStatus }) => {
  if (!server || !server.cloud) return (
    <div className="server-logs error">
      This server is not managed by this Hyphe-Browser yet.
    </div>
  )

  const [logs, setLogs] = useState('')
  const [error, setError] = useState(null)

  // Reload logs to display every 500ms until the server is installed:
  useRetry(retry => {
    const url = (server.cloud || {}).logsURL

    if (url) {
      return fetch(url)
        .then(response => response.text())
        .then(text => {
          setLogs(text)
          setError(null)

          if (!server.cloud.installed) retry()
        })
        .catch(() => {
          if (!server.cloud.installed) retry()
        })
    }
  }, 500)

  // Check every 2000ms if the server is installed, and update it when it is:
  useRetry(retry => {
    const url = server.url

    if (url && !server.cloud.installed) {
      return isInstalledPromise(server)
        .then(() => fetchServerStatus(url))
        .then(({ payload }) => !payload.error && fetchCorpora(url))
        .then(() => updateServer({
          ...server,
          cloud: {
            ...server.cloud,
            installed: true,
            running: true,
          }
        }))
        .catch(retry)
    }
  }, 2000)

  const message = error || logs

  return (
    <div className={ cx('server-logs', error && 'error') }>
      { message && message.split('\n').map((s, i) => <div key={ i }>{s}</div>) }
      { !server.cloud.installed && <Ellipsis /> }
    </div>
  )
}

SelectedServerLogs.propTypes = {
  server: PropTypes.object,
  updateServer: PropTypes.func.isRequired,
  fetchCorpora: PropTypes.func.isRequired,
  fetchServerStatus: PropTypes.func.isRequired
}

export default connect(
  ({ servers }) => ({ server: servers.selected }),
  { updateServer, fetchCorpora, fetchServerStatus }
)(SelectedServerLogs)
