// deploying a Hyphe cloud server (multiple steps)

import React from 'react'
import cx from 'classnames'
import Modal from 'react-modal'
import PropTypes from 'prop-types'
import { sortBy } from 'lodash'
import { connect } from 'react-redux'
import { FormattedMessage as T, injectIntl } from 'react-intl'
import { OpenStackClient } from 'openstack-client'

import { saveCredentials } from '../../actions/cloud'
import { createServer } from '../../actions/servers'
import hosts from '../../assets/openstack-hosts'
import Link from '../../components/Link'

import postInstallScript from 'raw-loader!../../assets/post-install.sh'
import Ellipsis from '../../components/Ellipsis'
import promiseRetry from '../../utils/promise-retry'

Modal.setAppElement(document.getElementById('root'))

// Default values for select inputs:
const NULL_SELECT_VALUE = 'HYPHE-BROWSER::NO-VALUE'

// Form steps:
const STEP_INTRO = 0
const STEP_CONNECTION = 1
const STEP_CONFIGURE_HYPHE = 2
const STEP_CONFIGURE_SERVER = 3
const STEP_DEPLOYMENT = 4

// Deployment steps:
const DEPLOYING_SSH = 1
const DEPLOYING_SERVER = 2
const DEPLOYING_HYPHE = 3
const DEPLOYMENT_DONE = 4

// Quick helper to retrieve some OpenStack server data's IP address:
function getIP (server) {
  return Object.keys(server.addresses)
    .reduce((ips, key) => ips.concat(
      server.addresses[key]
        .filter(({ version }) => version === 4)
        .map(({ addr }) => addr)
    ), [])[0]
}

class CreateServerForm extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      processing: false,
      errors: [],
      step: STEP_INTRO,
      data: this.getInitData(),
    }
  }

  getInitData () {
    return {
      // Step 1:
      host: NULL_SELECT_VALUE,
      keystoneURL: '',
      openStackID: '',
      openStackPassword: '',

      // Step 2:
      hypheConfig: null,

      // Step 3:
      serverName: '',
      dataCenter: NULL_SELECT_VALUE,
      server: NULL_SELECT_VALUE,
      confirmDeploy: false,

      // Step 4:
      deployStep: 0, // or DEPLOYING_SSH or DEPLOYING_SERVER or DEPLOYING_HYPHE
      sshData: null,
      serverData: null,
    }
  }

  /**
   * This method returns true if the form should be disabled (because something
   * is loading, data are invalid, etc...) or not, relatively the the current
   * `state.step` value.
   */
  isDisabled () {
    const { processing, data, step } = this.state

    if (processing) {
      return true
    }

    switch (step) {
    case STEP_CONNECTION:
      return !data.host || !hosts[data.host] || !data.keystoneURL || !data.openStackID || !data.openStackPassword

    case STEP_CONFIGURE_HYPHE:
      if (!(data.hypheConfig || '').trim()) {
        return false
      }

      try {
        JSON.parse(data.hypheConfig)
        return false
      } catch (e) {
        return true
      }

    case STEP_CONFIGURE_SERVER:
      return !data.serverName || data.dataCenter === NULL_SELECT_VALUE || data.serverFlavor === NULL_SELECT_VALUE

    case STEP_DEPLOYMENT:
      return data.deployStep < DEPLOYING_HYPHE
    default:
      return false
    }
  }

  /**
   * This method handles submitting the form at each step. It does not do
   * anything if `this.isDisabled()` is true.
   *
   * The default behavior is simply to increment the `state.step` value, but it
   * can do more for some steps:
   */
  onSubmit = () => {
    const { data, step } = this.state

    if (this.isDisabled()) {
      return
    }

    switch (step) {
    case STEP_CONNECTION:
      this.setState({ ...this.state, processing: true })
      this.openStackClient
        .authenticate(data.openStackID, data.openStackPassword)
        .then(() => this.openStackClient.getRegions('compute'))
        .then(regions => {
          this.props.saveCredentials(
            data.host,
            {id: data.openStackID, password: data.openStackPassword}
          )

          this.setState({
            ...this.state,
            processing: false,
            errors: [],
            step: step + 1,
            data: {
              ...data,
              dataCentersList: regions.map(({ region, region_id }) => ({ key: region_id, label: region }))
            }
          })
        })
        .catch(() => {
          this.setState({
            ...this.state,
            processing: false,
            errors: ['create-cloud-server.step1.error.wrong-credentials']
          })
        })
      break

    case STEP_CONFIGURE_SERVER:
      if (!data.confirmDeploy) {
        this.setDataState('confirmDeploy', true)
      } else {
        this.setState({
          ...this.state,
          step: this.state.step + 1,
          data: {
            ...this.state.data,
            confirmDeploy: false,
            deployStep: DEPLOYING_SSH
          }
        })

        const {
          dataCenter,
          serverName,
          host,
          serverFlavor
        } = this.state.data

        this.openStackClient
          // Check if there is an SSH key already
          .getComputeKeypairs(dataCenter, { limit: 1 })
          .then((sshKeys) => {
            return sshKeys.length ?
              sshKeys[0] :
              this.openStackClient.setComputeKeypair(dataCenter, `ssh-${serverName}`)
          })
          // Create server
          .then(sshKey => {
            this.setDataState('deployStep', DEPLOYING_SERVER)
            this.setDataState('sshData', sshKey)

            return this.openStackClient.createComputeServer(
              dataCenter,
              serverName,
              hosts[host].image.id,
              serverFlavor,
              { key_name: sshKey.name, user_data: btoa(postInstallScript) }
            )
          })
          // Load full server data until the status is "ACTIVE"
          .then(server => promiseRetry(() => this.openStackClient
            .getComputeServer(dataCenter, server.id)
            .then(fullServer => {
              return (fullServer.status === 'ACTIVE' && getIP(fullServer)) ?
                Promise.resolve(fullServer) :
                Promise.reject('nope')
            }), 2000)
          )
          // Start monitoring Hyphe state
          .then(server => {
            this.setState({
              ...this.state,
              data: {
                ...this.state.data,
                deployStep: DEPLOYING_HYPHE,
                serverData: server,
              }
            })

            const ip = getIP(server)
            const url = `http://${ip}/api/`
            const home = `http://${ip}/`

            this.props.createServer({
              url,
              home,
              name: `[cloud] ${serverName}`,
              cloud: true,
            })

            return promiseRetry(() => fetch(url).then(r => r.json()), 2000)
          })
          .then(() => {
            this.setState({
              ...this.state,
              data: {
                ...this.state.data,
                deployStep: DEPLOYMENT_DONE,
              }
            })
          })
          .catch(error => {
            // TODO:
            // Notify an error has occured
            console.log('Deployment failed', error)
          })
      }
      break

    case STEP_DEPLOYMENT:
      this.props.history.push('/login')
      break

    default:
      this.setState({ ...this.state, step: this.state.step + 1 })
    }
  }

  /**
   * This method handles the back / cancel button. It basically goes back one
   * step when possible, and open back the `"/login"` view else:
   */
  onCancel = () => {
    switch (this.state.step) {
    case STEP_INTRO:
      this.props.history.push('/login')
      break
    default:
      this.setState({ ...this.state, step: this.state.step - 1 })
      break
    }
  }

  setDataState = (key, value) => {
    this.setState({
      ...this.state,
      data: {
        ...this.state.data,
        [key]: value
      }
    })
  }
  onHostChange = (value) => {
    if (value === NULL_SELECT_VALUE || !hosts[value]) {
      this.openStackClient = null
      this.setDataState('host', NULL_SELECT_VALUE)
    } else {
      this.openStackClient = new OpenStackClient(hosts[value].keystone)
      const creds = this.props.credentials[value]
      this.setState({
        ...this.state,
        data: {
          ...this.state.data,
          host: value,
          keystoneURL: hosts[value].keystone,
          ...(creds ? {openStackID: creds.id, openStackPassword: creds.password} : {})
        }
      })
    }
  }
  onDatacenterChange = (value) => {
    if (value === NULL_SELECT_VALUE) {
      this.setState({
        ...this.state,
        data: {
          ...this.state.data,
          dataCenter: value,
          serverFlavorsList: null,
          serverFlavor: NULL_SELECT_VALUE
        }
      })
    } else {
      this.setState({
        ...this.state,
        processing: true,
        data: {
          ...this.state.data,
          dataCenter: value,
          serverFlavorsList: null,
          serverFlavor: NULL_SELECT_VALUE
        }
      })
      this.openStackClient
        .getComputeFlavors(value)
        .then(flavors => {
          this.setState({
            ...this.state,
            processing: false,
            data: {
              ...this.state.data,
              serverFlavorsList: sortBy(flavors, flavor => flavor.name)
                .map(({ name, id }) => ({ key: id, label: name }))
            }
          })
        })
        .catch(() => {
          this.setState({
            ...this.state,
            processing: false,
            errors: ['create-cloud-server.step3.error.unknown-api-error']
          })
        })
    }
  }

  renderFormGroup (key, labelKey, { onChange, type = 'text', options = [], attributes = {} } = {}) {
    const { step, data } = this.state
    const id = `step${step}-${key}`
    const handler = ({ target }) => {
      return onChange ? onChange(target.value) : this.setDataState(key, target.value)
    }
    let input

    if (type === 'textarea') {
      input = (
        <textarea
          id={ id }
          value={ data[key] || '' }
          onChange={ handler }
          { ...attributes }
        />
      )
    } else if (type === 'select') {
      input = (
        <select
          id={ id }
          value={ data[key] }
          onChange={ handler }
          { ...attributes }
        >
          { options.map(({ key, label }) => <option key={ key } value={ key }>{label}</option>) }
        </select>
      )
    } else {
      input = (
        <input
          id={ id }
          type={ type }
          onChange={ handler }
          value={ data[key] || '' }
          { ...attributes }
        />
      )
    }

    return (
      <div className="form-group">
        <label htmlFor={ id }><T id={ labelKey } /></label>
        {input}
      </div>
    )
  }

  render () {
    const { step, data } = this.state
    const { intl: { formatMessage } } = this.props

    return (
      <form
        className="create-server-form"
        onSubmit={ e => {
          e.preventDefault()
          this.onSubmit()
        } }
      >
        <h3 className="section-header">
          <T id={ `create-cloud-server.step${step}.title` } />
        </h3>

        {this.state.errors.map((error) =>
          <div className="form-error" key={ error }><T id={ error } /></div>
        )}

        {
          /* Step 0: Introduction text */
          step === STEP_INTRO &&
          <>
            <p><T id="create-cloud-server.step0.p1" /></p>
            <p><T id="create-cloud-server.step0.p2" /></p>
            <p><T id="create-cloud-server.step0.p3" /></p>
            <ul>
              <li><T id="create-cloud-server.step0.p3.l1" /></li>
              <li><T id="create-cloud-server.step0.p3.l2" /></li>
              <li><T id="create-cloud-server.step0.p3.l3" /></li>
              <li><T id="create-cloud-server.step0.p3.l4" /></li>
              <li><T id="create-cloud-server.step0.p3.l5" /></li>
              <li><T id="create-cloud-server.step0.p3.l6" /></li>
            </ul>
            <h4><T id="create-cloud-server.step0.note" /></h4>
            <p><T id="create-cloud-server.step0.p4" /></p>
          </>
        }

        {
          /* Step 1: Cloud provider account creation */
          step === STEP_CONNECTION &&
          <>
            <p>
              <T id="create-cloud-server.step1.p1" />
              <Link url="https://docs.openstack.org/train/">
                <T id="create-cloud-server.step1.p1.link" />
              </Link>
            </p>

            {
              this.renderFormGroup(
                'host',
                'create-cloud-server.step1.host',
                {
                  type: 'select',
                  onChange: this.onHostChange,
                  options: [
                    {
                      key: NULL_SELECT_VALUE,
                      label: formatMessage({ id: 'create-cloud-server.step1.host-placeholder' })
                    },
                    ...Object.keys(hosts).map(key => ({ key, label: key }))
                  ]
                }
              )
            }
            {this.renderFormGroup('keystoneURL', 'create-cloud-server.step1.keystone-url', { attributes: { disabled: true } })}
            {this.renderFormGroup('openStackID', 'create-cloud-server.step1.openstack-id')}
            {this.renderFormGroup('openStackPassword', 'create-cloud-server.step1.openstack-password', { type: 'password' })}
          </>
        }

        {
          /* Step 2: Hyphe configuration */
          step === STEP_CONFIGURE_HYPHE &&
          <>
            <p>
              <T id="create-cloud-server.step2.p1" />
            </p>

            {this.renderFormGroup('hypheConfig', 'create-cloud-server.step2.hyphe-config', { type: 'textarea', attributes: { rows: '7', style: { resize: 'vertical' } } })}
          </>
        }

        {
          /* Step 3: Server configuration */
          step === STEP_CONFIGURE_SERVER &&
          <>
            <p>
              <T id="create-cloud-server.step3.server-name-description" />
            </p>

            {
              this.renderFormGroup(
                'serverName',
                'create-cloud-server.step3.server-name',
                {
                  attributes: {
                    placeholder: formatMessage({ id: 'create-cloud-server.step3.server-name-placeholder' })
                  }
                }
              )
            }

            <p>
              <T id="create-cloud-server.step3.datacenter-description-1" />
              <Link url={ hosts[this.state.data.host].dataCenterURL }><T id="create-cloud-server.step3.datacenter-description-link" /></Link>
              <T id="create-cloud-server.step3.datacenter-description-2" />
            </p>

            {
              this.renderFormGroup(
                'dataCenter',
                'create-cloud-server.step3.datacenter',
                {
                  type: 'select',
                  onChange: this.onDatacenterChange,
                  options: [
                    { key: NULL_SELECT_VALUE, label: formatMessage({ id: 'create-cloud-server.step3.datacenter-placeholder' }) },
                    ...(data.dataCentersList || [])
                  ],
                  attributes: {
                    disabled: !data.dataCentersList || !data.dataCentersList.length
                  }
                }
              )
            }

            <p>
              <T id="create-cloud-server.step3.pricing-description-1" />
              <Link url={ hosts[this.state.data.host].priceURL }><T id="create-cloud-server.step3.pricing-description-link" /></Link>
              <T id="create-cloud-server.step3.pricing-description-2" />
            </p>

            {
              this.renderFormGroup(
                'serverFlavor',
                'create-cloud-server.step3.server-capacity',
                {
                  type: 'select',
                  options: [
                    { key: NULL_SELECT_VALUE, label: formatMessage({ id: 'create-cloud-server.step3.server-capacity-placeholder' }) },
                    ...(data.serverFlavorsList || [])
                  ],
                  attributes: {
                    disabled: data.dataCenter === NULL_SELECT_VALUE || !data.serverFlavorsList || !data.serverFlavorsList.length
                  }
                }
              )
            }

            {
              <Modal
                isOpen={ data.confirmDeploy }
                onRequestClose={ () => this.setDataState('confirmDeploy', false) }
                style={ {
                  content: {
                    width: 700,
                    maxWidth: '40vw',
                    position: 'relative',
                    height: 'unset',
                    top: 0,
                    left: 0,
                    overflow: 'hidden',
                    padding: 0
                  }
                } }
              >
                <div className="modal-content-container">
                  <div className="modal-content-header">
                    <h2><T id="create-cloud-server.step3.confirm-deploy.title" /></h2>
                  </div>
                  <div className="modal-content-body">
                    <T id="create-cloud-server.step3.confirm-deploy.text" />
                  </div>
                  <div className="modal-content-footer">
                    <ul className="buttons-row">
                      <li>
                        <button onClick={ () => this.setDataState('confirmDeploy', false) } className="btn btn-error">
                          <T id="cancel" />
                        </button>
                      </li>

                      <li>
                        <button onClick={ () => this.onSubmit() } className="btn btn-primary">
                          <T id="create-cloud-server.step3.confirm-deploy.action" />
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </Modal>
            }

          </>
        }

        {
          /* Step 4: Server deployment */
          step === STEP_DEPLOYMENT &&
          <>
            { data.deployStep === DEPLOYING_SSH && <p><T id="create-cloud-server.step4.deploy-ssh" /><Ellipsis /></p> }
            { data.deployStep > DEPLOYING_SSH && <p><T id="create-cloud-server.step4.ssh-deployed" /></p> }

            { data.deployStep === DEPLOYING_SERVER && <p><T id="create-cloud-server.step4.deploy-server" /><Ellipsis /></p> }
            { data.deployStep > DEPLOYING_SERVER && <p><T id="create-cloud-server.step4.server-deployed" /></p> }

            { data.deployStep === DEPLOYING_HYPHE && <p><T id="create-cloud-server.step4.deploy-hyphe" /><Ellipsis /></p> }
            { data.deployStep > DEPLOYING_HYPHE && <p><T id="create-cloud-server.step4.hyphe-deployed" /></p> }
          </>
        }

        <div className="buttons-row">
          {
            step < STEP_DEPLOYMENT &&
            <li>
              <button type="button" className="btn btn-error" disabled={ this.state.submitting } onClick={ this.onCancel }>
                <T id={ step === STEP_INTRO ? 'cancel' : 'back' } />
              </button>
            </li>
          }
          <li className="main-button-container">
            <button className={ cx('btn btn-primary', { 'is-disabled': this.isDisabled() }) }>
              <T id={ `create-cloud-server.step${step}.submit` } />
            </button>
          </li>
        </div>
      </form>
    )
  }
}

CreateServerForm.propTypes = {
  // router
  history: PropTypes.shape({
    push: PropTypes.func,
  }),

  locale: PropTypes.string.isRequired,
  credentials: PropTypes.object,

  // actions
  createServer: PropTypes.func,
  saveCredentials: PropTypes.func
}

CreateServerForm.contextTypes = {
  intl: PropTypes.object,
}

const mapStateToProps = ({ cloud, intl: { locale } }) => ({
  locale,
  credentials: cloud.credentials
})

export default injectIntl(connect(mapStateToProps, {
  createServer,
  saveCredentials,
})(CreateServerForm))
