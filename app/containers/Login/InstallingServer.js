import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'

import ServerLogs from '../../components/ServerLogs'
import { useRetry } from '../../utils/hooks'
import { updateServer } from '../../actions/servers'
import { isInstalledPromise } from '../../utils/cloud-helpers'

const InstallingServer = ({ server, updateServer }) => {
  useRetry(retry => {
    const url = server.url

    if (url) {
      return isInstalledPromise(server)
        .then(() => {
          updateServer({
            ...server,
            cloud: {
              ...server.cloud,
              installed: true,
            }
          })
        }).catch(retry)
    }
  }, 2000)

  return (
    <div className="installing-server-container">
      <h3 className="section-header"><T id="server-being-installed" /></h3>
      <ServerLogs server={ server } />
    </div>
  )
}

InstallingServer.propTypes = {
  server: PropTypes.object.isRequired,
  updateServer: PropTypes.func.isRequired
}

export default connect(null,{ updateServer })(InstallingServer)
