// displayed when a server is selected

import cx from 'classnames'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Link from '../../components/Link'
import Ellipsis from '../../components/Ellipsis'
import { FormattedMessage as T, injectIntl } from 'react-intl'
import Modal from 'react-modal'
import {
  deleteServer,
  startCloudServer,
  stopCloudServer,
  deleteCloudServer,
  fetchCloudServerStatus
} from '../../actions/servers'
import { fetchCorpora, fetchServerStatus } from '../../actions/corpora'
import {
  SERVER_STATUS_ACTIVE, SERVER_STATUS_PROCESSING,
  SERVER_STATUS_SHUTOFF
} from '../../constants'

const ServerSumup = props => {
  const { server, isLoading, intl: { formatMessage } } = props
  const { fetchCloudServerStatus, fetchServerStatus, fetchCorpora } = props
  const [confirmPrompted, setConfirmPrompted] = useState(false)
  const [successPrompted, setSuccessPrompted] = useState(false)
  const [processing, setProcessing] = useState(false)

  if (!server) return null

  let label
  let actionName = 'stop'
  let action = props.stopCloudServer
  let actionDisabled = false
  if (server.cloud) {
    const { installed, status } = server.cloud

    if (!installed) {
      label = formatMessage({ id: 'server-status-installing' })
      actionDisabled = true
    }
    else if (status === SERVER_STATUS_ACTIVE) {
      label = formatMessage({ id: 'server-status-ok' })
      actionName = 'stop'
      action = props.stopCloudServer
    }
    else if (status === SERVER_STATUS_SHUTOFF) {
      label = formatMessage({ id: 'server-status-stopped' })
      actionName = 'start'
      action = props.startCloudServer
    }
    else if (status === SERVER_STATUS_PROCESSING) {
      label = (
        <>
          { formatMessage({ id: 'server-status-processing' }) + ' ' + server.cloud.tasks.join(', ') }
          <Ellipsis />
        </>
      )
      actionName = 'stop'
      action = props.stopCloudServer
      actionDisabled = true
    }
    else {
      label = formatMessage({ id: 'server-status-unknown' })
      actionName = 'stop'
      action = props.stopCloudServer
      actionDisabled = true
    }

    if (isLoading) label = (
      <>
        { formatMessage({ id: 'server-status-loading' }) }
        <Ellipsis />
      </>
    )
  }

  return (
    <div className="server-sumup-container">
      <div>
        <p className="server-sumup-label"><T id="server-api-url" /></p>
        <p className="server-sumup-value">
          <i className="ti-link" />
          <Link url={ server.url }>
            { server.url }
          </Link>
        </p>
      </div>
      <div>
        <p className="server-sumup-label"><T id="server-gui-url" /></p>
        <p className="server-sumup-value">
          <i className="ti-link" />
          <Link url={ server.home }>
            { server.home }
          </Link>
        </p>
      </div>
      {
        server.cloud &&
        <>
          <div>
            <p className="server-sumup-label"><T id="server-status" /></p>
            <p className="server-sumup-value">{ label }</p>
          </div>
          <div>
            <p className="server-sumup-label">Actions</p>
          </div>
          <div className="buttons-row">
            <li className="small">
              <button
                className={ cx('btn btn-primary', isLoading && 'is-disabled') }
                onClick={ () => {
                  if (!isLoading)
                    return fetchCloudServerStatus(server)
                      .then(() => fetchServerStatus(server.url))
                      .then(({ payload }) => !payload.error && fetchCorpora(server.url))
                } }
              >
                <i className="ti-reload" />
              </button>
            </li>
            <li>
              <button
                className={ cx('btn btn-primary', (isLoading || actionDisabled) && 'is-disabled') }
                onClick={ () => !isLoading && action(server) }
              >
                <T id={ 'server-' + actionName } />
              </button>
            </li>
            <li>
              <button
                className={ cx('btn btn-negative', isLoading && 'is-disabled') }
                onClick={ () => !isLoading && setConfirmPrompted(true) }
              >
                <T id="server-delete" />
              </button>
            </li>
          </div>
        </>
      }

      {/* Server deletion confirm modal */}
      <Modal
        isOpen={ confirmPrompted }
        onRequestClose={ () => !processing && setConfirmPrompted(false) }
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
            <h2><T id="delete-server-title" /></h2>
          </div>
          <div className="modal-content-body">
            <T id="delete-server-confirm" />
          </div>
          <div className="modal-content-footer">
            <ul className="buttons-row">
              <li>
                <button
                  className="btn btn-error"
                  onClick={ () => !processing && setConfirmPrompted(false) }
                >
                  <T id="cancel" />
                </button>
              </li>
              <li>
                <button
                  className={ cx('btn btn-primary', processing && 'is-disabled') }
                  onClick={ () => {
                    setProcessing(true)
                    props.deleteCloudServer(server)
                      .then(() => {
                        setSuccessPrompted(true)
                        setProcessing(false)
                        setConfirmPrompted(false)
                      })
                      .catch(() => setConfirmPrompted())
                  } }
                >
                  <T id="server-delete" />
                  { processing && <Ellipsis /> }
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Server deleted information modal */}
      <Modal
        isOpen={ successPrompted }
        onRequestClose={ () => {
          setSuccessPrompted(false)
          props.deleteServer(server)
        } }
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
            <h2><T id="deleted-server-title" /></h2>
          </div>
          <div className="modal-content-body">
            <T id="deleted-server-info" />
          </div>
          <div className="modal-content-footer">
            <ul className="buttons-row">
              <li>
                <button
                  className="btn btn-success"
                  onClick={ () => {
                    setSuccessPrompted(false)
                    props.deleteServer(server)
                  } }
                >
                  <T id="ok" />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  )
}

ServerSumup.propTypes = {
  locale: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  server: PropTypes.object,

  // actions
  startCloudServer: PropTypes.func,
  stopCloudServer: PropTypes.func,
  deleteCloudServer: PropTypes.func,
  fetchCorpora: PropTypes.func,
  fetchCloudServerStatus: PropTypes.func,
}

const mapStateToProps = ({ servers, intl: { locale }, ui: { loaders } }) => ({
  locale,
  isLoading: !!loaders.cloudserver_action,
  server: servers.selected,
})

export default injectIntl(connect(mapStateToProps, {
  startCloudServer,
  stopCloudServer,
  deleteCloudServer,
  deleteServer,
  fetchCorpora,
  fetchCloudServerStatus,
  fetchServerStatus
})(ServerSumup))
