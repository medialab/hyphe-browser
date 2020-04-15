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

  initialData = {
    serverName: '',
    dataCenter: NULL_SELECT_VALUE,
    serverFlavor: NULL_SELECT_VALUE,
    showConfirmModal: false,
  }
  isDisabled (data) {
    const { serverName, dataCenter, serverFlavor } = data
    return !serverName || !dataCenter || dataCenter === NULL_SELECT_VALUE || !serverFlavor || serverFlavor === NULL_SELECT_VALUE
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
            .map(({ name, id }) => ({ key: id, label: name }))
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

  render () {
    const { hostData, dataCentersList, serverFlavorsList, dataCenter, showConfirmModal } = this.props.data
    const { intl: { formatMessage } } = this.props

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
                { key: NULL_SELECT_VALUE, label: formatMessage({ id: 'create-cloud-server.step3.server-capacity-placeholder' }) },
                ...(serverFlavorsList || [])
              ],
              attributes: {
                disabled: dataCenter === NULL_SELECT_VALUE || !serverFlavorsList || !serverFlavorsList.length
              }
            }
          )
        }

        {
          <Modal
            isOpen={ showConfirmModal }
            onRequestClose={ () => this.setDataState('showConfirmModal', false) }
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
                    <button onClick={ () => this.setDataState('showConfirmModal', false) } className="btn btn-error">
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
    )
  }
}

export default ServerConfigurationStep
