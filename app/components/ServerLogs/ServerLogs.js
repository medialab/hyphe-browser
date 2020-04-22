import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'

import Ellipsis from '../Ellipsis'
import { useRetry } from '../../utils/hooks'

import './ServerLogs.styl'

const ServerLogs = ({
  server,
  showError = true
}) => {
  const [logs, setLogs] = useState('')
  const [error, setError] = useState(null)

  useRetry(retry => {
    const url = (server.cloud || {}).logsURL

    if (url) {
      return fetch(url)
        .then(response => response.text())
        .then(text => {
          setLogs(text)
          setError(null)
          retry()
        })
        .catch((e) => {
          if (showError) {
            const baseMsg = 'An error occured while fetching the installation log'
            setError(e.message ? baseMsg + ':\n' + e.message : baseMsg)
          } else {
            retry()
          }
        })
    } else {
      return retry()
    }
  }, 500)

  const message = error || logs

  return (
    <div className={ cx('server-logs', error && 'error') }>
      { message ? message.split('\n').map((s, i) => <div key={ i }>{s}</div>) : <Ellipsis /> }
    </div>
  )
}

ServerLogs.propTypes = {
  server: PropTypes.object.isRequired,
  showError: PropTypes.bool
}

export default ServerLogs
