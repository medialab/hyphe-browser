import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'

import CreateServerFormStep from './CreateServerFormStep'
import Ellipsis from '../../../components/Ellipsis'
import postInstallScript from 'raw-loader!openstack-client/test/shell/script.sh'
import promiseRetry from '../../../utils/promise-retry'
import { getIP, isInstalledPromise } from '../../../utils/cloud-helpers'
import { createServer, updateServer } from '../../../actions/servers'
import ServerLogs from '../../../components/ServerLogs'

class DeployStep extends CreateServerFormStep {
  constructor (props) {
    super(props)

    if (!props.data.deploying) {
      this.deployServer()
    }
  }

  initialData = {
    deploying: false,
    hypheServerData: null,
    sshData: null,
    serverData: null,
  }
  deployServer () {
    const { data, setData, setError, setIsProcessing } = this.props
    const { openStackClient, host, dataCenter, serverName, hostData, serverFlavor } = data

    setData({ ...data, deploying: true })
    setIsProcessing(true)

    Promise.all([
      // Check if there is an SSH key already
      openStackClient
        .getComputeKeypairs(dataCenter, { limit: 1 })
        .then((sshKeys) => {
          return sshKeys.length ?
            sshKeys[0] :
            openStackClient.setComputeKeypair(dataCenter, `ssh-${serverName}`)
        }),
      // Retrieve proper image ID
      openStackClient
        .getImages(dataCenter, {
          name: hostData.image.name
        }).then(images => images[0].id)
    ])
      // Create server
      .then(([sshKey, imageId]) => {
        setData({
          ...this.props.data,
          sshData: sshKey,
        })

        // Prepare script:
        // TODO: Insert proper Hyphe env variables
        const script = postInstallScript

        return openStackClient.createComputeServer(
          dataCenter,
          serverName,
          imageId,
          serverFlavor,
          { key_name: sshKey.name, user_data: btoa(script) }
        )
      })
      // Load full server data until the status is "ACTIVE"
      .then(server => promiseRetry(() => openStackClient
        .getComputeServer(dataCenter, server.id)
        .then(fullServer => {
          return (fullServer.status === 'ACTIVE' && getIP(fullServer)) ?
            Promise.resolve(fullServer) :
            Promise.reject('nope')
        }), 2000)
      )
      // Start monitoring Hyphe state
      .then(server => {
        const ip = getIP(server)
        const url = `http://${ip}:81/api/`
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
            deployed: true,
            installed: false
          }
        }

        setData({
          ...this.props.data,
          serverData: server,
          hypheServerData,
        })

        setIsProcessing(false)
        this.props.createServer(hypheServerData)
        return promiseRetry(() => isInstalledPromise(hypheServerData), 2000)
      })
      .then(() => {
        const hypheServerData = this.props.data.hypheServerData
        this.props.updateServer({ ...hypheServerData, cloud: { ...hypheServerData.cloud, installed: true } })
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
    const { hypheServerData } = this.props.data

    return (
      <>
        { !hypheServerData && <p><T id="create-cloud-server.step4.deploy-server" /><Ellipsis /></p> }
        { hypheServerData && <p><T id="create-cloud-server.step4.server-deployed" /></p> }

        { hypheServerData && !(hypheServerData.cloud || {}).installed && <p><T id="create-cloud-server.step4.deploy-hyphe" /><Ellipsis /></p> }
        { hypheServerData && (hypheServerData.cloud || {}).installed && <p><T id="create-cloud-server.step4.hyphe-deployed" /></p> }
        { hypheServerData && <ServerLogs showError={ false } server={ hypheServerData } /> }
      </>
    )
  }
}

export default connect(
  ({ cloud }) => ({ credentials: cloud.credentials }),
  { createServer, updateServer },
  null,
  { forwardRef: true }
)(DeployStep)
