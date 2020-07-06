import React from 'react'
import { connect } from 'react-redux'
import { saveCredentials } from '../../../actions/cloud'
import { FormattedMessage as T } from 'react-intl'

import CreateServerFormStep, { NULL_SELECT_VALUE } from './CreateServerFormStep'
import Link from '../../../components/Link'
import HOSTS from '../../../assets/openstack-hosts'
import { OpenStackClient } from 'openstack-client'

class AuthenticationStep extends CreateServerFormStep {
  constructor (props) {
    super(props)
  }

  getInitialData () {
    return {
      host: NULL_SELECT_VALUE,
      hostData: null,
      keystoneURL: '',
      domain: '',
      project: '',
      openStackID: '',
      openStackPassword: '',
      openStackClient: null,
    }
  }
  isDisabled (data) {
    const { hostData, keystoneURL, domain, project, openStackID, openStackPassword } = data
    return (
      !hostData
      || !keystoneURL || keystoneURL === NULL_SELECT_VALUE
      || !domain
      || (hostData.projectRequired && !project)
      || !openStackID || !openStackPassword
    )
  }
  handleSubmit = (doSubmit) => {
    const { setError, setIsProcessing } = this.props
    const { host, hostData, keystoneURL, domain, project, openStackID, openStackPassword } = this.props.data
    const regionsDict = (hostData || {}).dataCenters || {}

    const openStackClient = new OpenStackClient(keystoneURL)

    setIsProcessing(true)

    openStackClient
      .authenticate(openStackID, openStackPassword, domain, project)
      .then(() => {
        this.props.saveCredentials(
          host,
          { id: openStackID, password: openStackPassword, project }
        )
      })
      .then(() => openStackClient.getRegions('compute'))
      .then(regions => {
        this.props.setData({
          ...this.props.data,
          openStackClient,
          dataCentersList: regions.map(({ region, region_id }) => ({ key: region_id, label: regionsDict[region] || region }))
        })
        setIsProcessing(false)
        setTimeout(doSubmit)
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Something went wrong during the authentication process', error)

        // If anything goes wrong, just notice parent of some error:
        setError('create-cloud-server.step1.error.wrong-credentials')
        setIsProcessing(false)
      })
  }
  changeHost = (host) => {
    if (!HOSTS[host] || host === NULL_SELECT_VALUE) {
      this.props.setData({
        ...this.props.data,
        host: NULL_SELECT_VALUE,
        hostData: null,
        keystoneURL: null
      })
    } else {
      const creds = this.props.credentials[host]
      this.props.setData({
        ...this.props.data,
        host,
        hostData: HOSTS[host],
        domain: HOSTS[host].domainName,
        project: HOSTS[host].projectRequired ? this.props.data.project : null,
        keystoneURL: HOSTS[host].keystone.length === 1 ?
          HOSTS[host].keystone[0].URL :
          NULL_SELECT_VALUE,
        ...(creds ? { openStackID: creds.id, openStackPassword: creds.password, project: creds.project } : {})
      })
    }
  }
  render () {
    const { data, intl: { formatMessage } } = this.props
    const hostData = data.hostData || {}
    const keystoneURLs = hostData.keystone || []

    return (
      <>
        <p>
          <T id="create-cloud-server.step1.p1" />
        </p>
        <p>
          <T id="create-cloud-server.step1.p2" />
          <Link url="https://github.com/medialab/hyphe-browser/blob/master/docs/user-doc-for-cloud-deployment.md">
            <T id="create-cloud-server.step1.p2.link" />
          </Link> (<T id="create-cloud-server.step1.p2.link-explanation" />).
        </p>

        {
          this.renderInput(
            'host',
            'create-cloud-server.step1.host',
            {
              type: 'select',
              onChange: this.changeHost,
              options: [
                {
                  key: NULL_SELECT_VALUE,
                  label: formatMessage({ id: 'create-cloud-server.step1.host-placeholder' })
                },
                ...Object.keys(HOSTS).map(key => ({ key, label: key }))
              ]
            }
          )
        }

        <div style={{display: hostData.publicCloudURL ? 'block' : 'none'}}>
          <small>
            <T id="create-cloud-server.step1.host-url" />
            <Link url={ hostData.publicCloudURL }>{ hostData.publicCloudURL }</Link>
            <br/>
            <T id="create-cloud-server.step1.host-prices" />
            <Link url={ hostData.priceURL }>{ hostData.priceURL }</Link>
            <br/>
            <br/>
          </small>
  
          {this.renderInput('openStackID', 'create-cloud-server.step1.openstack-id')}
          {this.renderInput('openStackPassword', 'create-cloud-server.step1.openstack-password', { type: 'password' })}
          {
            this.renderInput(
              'keystoneURL',
              'create-cloud-server.step1.keystone-url',
              {
                type: 'select',
                options: [
                  ...(keystoneURLs.length === 1 ?
                    [] :
                    [{
                      key: NULL_SELECT_VALUE,
                      label: formatMessage({ id: 'create-cloud-server.step1.keystone-placeholder' })
                    }]),
                  ...keystoneURLs.map(({ URL, label }) => ({ key: URL, label: label + ' - ' + URL }))
                ],
                attributes: { disabled: keystoneURLs.length <= 1 }
              }
            )
          }
          {this.renderInput('domain', 'create-cloud-server.step1.domain')}
          {hostData.projectRequired && this.renderInput('project', 'create-cloud-server.step1.project')}
        </div>
      </>
    )
  }
}

export default connect(
  ({ cloud }) => ({ credentials: cloud.credentials }),
  { saveCredentials },
  null,
  { forwardRef: true }
)(AuthenticationStep)
