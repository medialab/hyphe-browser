import React from 'react'
import { connect } from 'react-redux'
import { omitBy, isUndefined, mapValues } from 'lodash'
import { FormattedMessage as T } from 'react-intl'

import CreateServerFormStep from './CreateServerFormStep'
import { HYPHE_SETTINGS_KEY } from './HypheConfigurationStep'
import Ellipsis from '../../../components/Ellipsis'
import promiseRetry from '../../../utils/promise-retry'
import { getIP } from '../../../utils/cloud-helpers'
import { createServer, updateServer } from '../../../actions/servers'
import SelectedServerLogs from '../../../components/SelectedServerLogs'
import { SERVER_STATUS_UNKNOWN } from '../../../constants'

class DeployStep extends CreateServerFormStep {
  constructor (props) {
    super(props)

    if (!props.data.deploying) {
      this.deployServer()
    }
  }

  getInitialData () {
    return {
      deploying: false,
      hypheServerData: null,
      sshData: null,
      serverData: null,
    }
  }

  deployServer () {
    const { data, setData, setError, setIsProcessing } = this.props
    const { openStackClient, host, dataCenter, serverName, hostData, serverFlavor, serverHasNoDisk, diskVolume } = data

    setData({ ...data, deploying: true })
    setIsProcessing(true)

    openStackClient
      // Step 1.
      // Get an SSH key or create one:
      .getComputeKeypairs(dataCenter, { limit: 1 })
      .then((sshKeys) => {
        return sshKeys.length ?
          sshKeys[0] :
          openStackClient.setComputeKeypair(dataCenter, `ssh-${serverName}`)
      })
      // Step 2.
      // Install Hyphe on a new server:
      .then(ssh => {
        setData({
          ...this.props.data,
          sshData: ssh
        })

        return openStackClient
          .hypheDeploy(dataCenter, omitBy({
            serverName,
            ssh,
            image: hostData.image.name,
            flavor: serverFlavor,
            disk: serverHasNoDisk ? (+diskVolume || 0) : undefined,
            hyphe_config: mapValues(
              omitBy(data[HYPHE_SETTINGS_KEY], isUndefined),
              value => value + ''
            )
          }, isUndefined))
      })
      // Step 3.
      // Wait for the server to be deployed (not installed):
      .then(server => promiseRetry(() => openStackClient
        .getComputeServer(dataCenter, server.id)
        .then(fullServer => {
          return (fullServer.status === 'ACTIVE' && getIP(fullServer)) ?
            Promise.resolve(fullServer) :
            Promise.reject('nope')
        }), 2000)
      )
      // Step 4.
      // Wait for Hyphe to be installed:
      .then(server => {
        const ip = getIP(server)
        const url = `http://${ip}/api/`
        const home = `http://${ip}/`
        const logsURL = `http://${ip}/install.log`
        const hypheServerData = {
          url,
          home,
          name: serverName,
          cloud: {
            host,
            logsURL,
            server: {
              id: server.id,
              region: dataCenter,
              flavor: serverFlavor
            },
            ssh: this.props.data.sshData,
            openStack: {
              keystone: data.keystoneURL,
              id: data.openStackID,
              password: data.openStackPassword,
              domain: data.domain,
              project: data.project
            },
            createdAt: Date.now(),
            installed: false,
            status: SERVER_STATUS_UNKNOWN
          }
        }

        setData({
          ...this.props.data,
          serverData: server,
          hypheServerData,
        })

        setIsProcessing(false)
        this.props.createServer(hypheServerData)
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Something went wrong while deploying the server', error)

        // If anything goes wrong, just notice parent of some error:
        setError('create-cloud-server.step4.error.default')
        setIsProcessing(false)
      })

  }
  render () {
    const { selectedServer } = this.props

    return (
      <>
        { !selectedServer && <p><T id="create-cloud-server.step4.deploy-server" /><Ellipsis /></p> }
        { selectedServer && <p><T id="create-cloud-server.step4.server-deployed" /></p> }

        { selectedServer && !selectedServer.cloud.installed && <p><T id="create-cloud-server.step4.deploy-hyphe" /><Ellipsis /></p> }
        { selectedServer && selectedServer.cloud.installed && <p><T id="create-cloud-server.step4.hyphe-deployed" /></p> }
        { selectedServer && <SelectedServerLogs /> }
      </>
    )
  }
}

export default connect(
  ({ cloud, servers }) => ({
    credentials: cloud.credentials,
    selectedServer: servers.selected
  }),
  { createServer, updateServer },
  null,
  { forwardRef: true }
)(DeployStep)
