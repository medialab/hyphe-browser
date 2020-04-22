import React from 'react'
import Modal from 'react-modal'
import { sortBy } from 'lodash'
import { FormattedMessage as T } from 'react-intl'

import Link from '../../../components/Link'
import CreateServerFormStep, { NULL_SELECT_VALUE } from './CreateServerFormStep'

Modal.setAppElement(document.getElementById('root'))

class ServerConfigurationStep extends CreateServerFormStep {
  constructor (props) {
    super(props)
  }

  getInitialData () {
    return {
      serverName: '',
      loadingFlavors: false,
      dataCenter: NULL_SELECT_VALUE,
      serverFlavor: NULL_SELECT_VALUE,
      showConfirmModal: false,

      // Flavor filtering:
      cpus: '1',
      ram: '4',
      disk: '0'
    }
  }
  isDisabled (data) {
    const { serverName, dataCenter, serverFlavor } = data
    return !serverName || !dataCenter || dataCenter === NULL_SELECT_VALUE || !serverFlavor || serverFlavor === NULL_SELECT_VALUE
  }
  handleSubmit = (doSubmit) => {
    const { data, setData } = this.props
    const { showConfirmModal } = data

    if (showConfirmModal) {
      doSubmit()
    } else {
      setData({ ...data, showConfirmModal: true })
    }
  }
  changeDatacenter = (value) => {
    const { setError, setIsProcessing, data, setData } = this.props
    const { openStackClient } = data

    if (value === NULL_SELECT_VALUE) {
      return setData({
        ...data,
        dataCenter: value,
        serverFlavorsList: null,
        serverFlavor: NULL_SELECT_VALUE
      })
    }

    setData({
      ...data,
      dataCenter: value,
      serverFlavorsList: null,
      serverFlavor: NULL_SELECT_VALUE
    })

    setIsProcessing(true)

    openStackClient
      .getComputeFlavors(value)
      .then(flavors => {
        setData({
          ...this.props.data,
          serverFlavorsList: sortBy(flavors, flavor => flavor.name)
        })
        setIsProcessing(false)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Something went wrong while loading the flavors list', error)

        // If anything goes wrong, just notice parent of some error:
        setError('create-cloud-server.step3.error.default')
        setIsProcessing(false)
      })
  }
  getFilteredFlavorsList () {
    const data = this.props.data
    const cpusNb = +data.cpus
    const ramNb = +data.ram
    const diskNb = +data.disk

    const list = (data.serverFlavorsList || [])
      .filter(server => (
        (server.vcpus >= cpusNb) &&
        (server.ram / 1024 >= ramNb) &&
        (server.disk >= diskNb)
      ))
      .map(({ name, id, vcpus, ram, disk }) => ({
        key: id,
        distance: (vcpus - cpusNb) + (ram / 1000 - ramNb) + (disk - diskNb),
        label: `${name} - ${vcpus} CPU${vcpus > 1 ? 's' : ''}, ${(ram / 1024).toFixed(2)}Go RAM, ${disk}Go disk`
      }))

    return sortBy(list, 'distance')
  }

  render () {
    const { isProcessing, data, setData, intl: { formatMessage } } = this.props
    const { hostData, dataCentersList, serverFlavorsList, dataCenter, showConfirmModal } = data

    return (
      <>
        <p>
          <T id="create-cloud-server.step3.server-name-description" />
        </p>

        {
          this.renderInput(
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
          <Link url={ hostData.dataCenterURL }><T id="create-cloud-server.step3.datacenter-description-link" /></Link>
          <T id="create-cloud-server.step3.datacenter-description-2" />
        </p>

        {
          this.renderInput(
            'dataCenter',
            'create-cloud-server.step3.datacenter',
            {
              type: 'select',
              onChange: this.changeDatacenter,
              options: [
                { key: NULL_SELECT_VALUE, label: formatMessage({ id: 'create-cloud-server.step3.datacenter-placeholder' }) },
                ...(dataCentersList || [])
              ],
              attributes: {
                disabled: !dataCentersList || !dataCentersList.length
              }
            }
          )
        }

        <p>
          <T id="create-cloud-server.step3.pricing-description-1" />
          <Link url={ hostData.priceURL }><T id="create-cloud-server.step3.pricing-description-link" /></Link>
          <T id="create-cloud-server.step3.pricing-description-2" />
        </p>

        {
          this.renderInput(
            'serverFlavor',
            'create-cloud-server.step3.server-capacity',
            {
              type: 'select',
              options: [
                { key: NULL_SELECT_VALUE, label: formatMessage({ id: isProcessing ?
                  'create-cloud-server.step3.server-capacity-loading-values' :
                  'create-cloud-server.step3.server-capacity-placeholder' }) },
                ...this.getFilteredFlavorsList()
              ],
              attributes: {
                disabled: dataCenter === NULL_SELECT_VALUE || !serverFlavorsList || !serverFlavorsList.length
              }
            }
          )
        }

        <div className="form-group">
          <label>
            <T id="create-cloud-server.step3.filter-flavors" />
          </label>
        </div>

        {
          ['cpus', 'ram', 'disk'].map(key => (
            this.renderInput(
              key,
              'create-cloud-server.step3.' + key,
              {
                type: 'number',
                horizontal: true,
                attributes: {
                  min: 0,
                  step: 1,
                  className:'narrow',
                  disabled: (isProcessing || !serverFlavorsList || !serverFlavorsList.length)
                }
              }
            )
          ))
        }

        {
          <Modal
            isOpen={ showConfirmModal }
            onRequestClose={ () => setData({ ...data, showConfirmModal: false }) }
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
                <p><T id="create-cloud-server.step3.confirm-deploy.p1" /></p>
                <p><T id="create-cloud-server.step3.confirm-deploy.p2" /></p>
              </div>
              <div className="modal-content-footer">
                <ul className="buttons-row">
                  <li>
                    <button onClick={ () => setData({ ...data, showConfirmModal: false }) } className="btn btn-error">
                      <T id="cancel" />
                    </button>
                  </li>

                  <li>
                    <button onClick={ () => this.props.submit() } className="btn btn-primary">
                      <T id="create-cloud-server.step3.confirm-deploy.action" />
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </Modal>
        }
      </>
    )
  }
}

export default ServerConfigurationStep
