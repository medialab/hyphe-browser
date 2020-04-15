import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'

import CreateServerFormStep from './CreateServerFormStep'
import Ellipsis from '../../../components/Ellipsis'
import postInstallScript from 'raw-loader!../../../assets/post-install.sh'
import promiseRetry from '../../../utils/promise-retry'
import { getIP } from '../../../utils/cloud-helpers'
import { createServer } from '../../../actions/servers'

const INITIAL_STEP = 0
const DEPLOYING_SSH = 1
const DEPLOYING_SERVER = 2
const DEPLOYING_HYPHE = 3
const DEPLOYMENT_DONE = 4

class DeployStep extends CreateServerFormStep {
  constructor (props) {
    super(props)

    if (!props.data.deploying) {
      this.deployServer()
    }
  }

  initialData = {
    deploying: false,
    deployStep: INITIAL_STEP,
    sshData: null,
    serverData: null,
  }
  deployServer () {
    const { data, setData, setError, setIsProcessing } = this.props
    const { openStackClient, host, dataCenter, serverName, hostData, serverFlavor } = data

    setData({ ...data, deploying: true })
    setIsProcessing(true)

    openStackClient
      // Check if there is an SSH key already
      .getComputeKeypairs(dataCenter, { limit: 1 })
      .then((sshKeys) => {
        return sshKeys.length ?
          sshKeys[0] :
          openStackClient.setComputeKeypair(dataCenter, `ssh-${serverName}`)
      })
      // Create server
      .then(sshKey => {
        setData({
          ...this.props.data,
          sshData: sshKey,
          deployStep: DEPLOYING_SERVER,
        })

        return openStackClient.createComputeServer(
          dataCenter,
          serverName,
          hostData.image.id,
          serverFlavor,
          { key_name: sshKey.name, user_data: btoa(postInstallScript) }
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
        setData({
          ...this.props.data,
          deployStep: DEPLOYING_HYPHE,
          serverData: server,
        })

        setIsProcessing(false)

        const ip = getIP(server)
        const url = `http://${ip}/api/`
        const home = `http://${ip}/`

        this.props.createServer({
          url,
          home,
          host,
          name: serverName,
          cloud: true,
          ready: false
        })

        return promiseRetry(() => fetch(url).then(r => r.json()), 2000)
      })
      .then(() => {
        setData({
          ...this.props.data,
          deployStep: DEPLOYMENT_DONE,
        })
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
    const { deployStep } = this.props.data

    return (
      <>
        { deployStep === DEPLOYING_SSH && <p><T id="create-cloud-server.step4.deploy-ssh" /><Ellipsis /></p> }
        { deployStep > DEPLOYING_SSH && <p><T id="create-cloud-server.step4.ssh-deployed" /></p> }

        { deployStep === DEPLOYING_SERVER && <p><T id="create-cloud-server.step4.deploy-server" /><Ellipsis /></p> }
        { deployStep > DEPLOYING_SERVER && <p><T id="create-cloud-server.step4.server-deployed" /></p> }

        { deployStep === DEPLOYING_HYPHE && <p><T id="create-cloud-server.step4.deploy-hyphe" /><Ellipsis /></p> }
        { deployStep > DEPLOYING_HYPHE && <p><T id="create-cloud-server.step4.hyphe-deployed" /></p> }
      </>
    )
  }
}

export default connect(
  ({ cloud }) => ({ credentials: cloud.credentials }),
  { createServer },
  null,
  { forwardRef: true }
)(DeployStep)
