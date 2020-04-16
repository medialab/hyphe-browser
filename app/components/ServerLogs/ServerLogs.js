import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'

import { getLogsURL } from '../../utils/cloud-helpers'

import './ServerLogs.styl'

function useRetry (callback, delay) {
  const savedCallback = useRef()

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the timeout
  useEffect(() => {
    function tick () {
      savedCallback.current(doRetry => {
        if (doRetry) {
          retry()
        }
      })
    }

    function retry () {
      if (delay !== null) {
        const id = setTimeout(tick, delay)
        return () => clearTimeout(id)
      }
    }

    return retry()
  }, [delay])
}


const ServerLogs = ({
  server
}) => {
  const [logs, setLogs] = useState('')
  const [error, setError] = useState(null)

  useRetry(callback => {
    const url = getLogsURL(server)

    if (url) {
      return fetch(url)
        .then(response => response.text())
        .then(text => {
          setLogs(text)
          callback(true)
        })
        .catch(() => {
          setError('An error occured.')
          callback(false)
        })
    } else {
      return callback(false)
    }
  }, 5000)

  return (
    <div className={ cx('server-logs', error && 'error') }>
      { error || logs }
    </div>
  )
}

ServerLogs.propTypes = {
  server: PropTypes.object.isRequired,
}

export default ServerLogs
