import React, { useState } from 'react'
import Modal from 'react-modal'
import PropTypes from 'prop-types'

import './ServerSelect.styl'

Modal.setAppElement(document.getElementById('root'))

const ServerSelect = ({
  selectedServer,
  servers,
  isDisabled,

  onChange,
  onEdit,
  onForget
}, { intl: { formatMessage } }) => {
  const options = [
    // add default option only when no server selected
    !selectedServer || !selectedServer.url ?
      {
        label: formatMessage({ id: 'select-server' }),
        value: '',
        key: 'default'
      } : undefined,
    // add registered servers list
    ...servers.map((s) => ({
      label: `${s.name} (${s.url})`,
      value: s.url,
      key: s.url
    })),
    {
      label: formatMessage({ id: 'server-add' }),
      value: 'add',
      key: 'server-add'
    }
  ].filter(o => o)

  const [forgetPrompted, setForgetPrompted] = useState(false)

  return (
    <>
      <div className="server-select">
        <select
          autoFocus
          value={selectedServer ? selectedServer.url : ""}
          disabled={isDisabled}
          onChange={(evt) => { if (evt.target.value) onChange(evt.target.value) }}
        >
          {options.map((o) => <option key={o.key + o.label} value={o.value}>{o.label}</option>)}
        </select>
        {
          selectedServer &&
          <>
            <button onClick={onEdit} className="hint--bottom" aria-label={formatMessage({ id: 'edit-server-tooltip' })}>
              <i className="ti-pencil" />
            </button>
            <button onClick={() => setForgetPrompted(true)} className="hint--bottom" aria-label={formatMessage({ id: 'forget-server-tooltip' })}>
              <i className="ti-trash" />
            </button>
          </>
        }
      </div>
      <Modal
        isOpen={forgetPrompted}
        onRequestClose={() => setForgetPrompted(false)}
        style={{
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
        }}
      >
        <div className="modal-content-container">
          <div className="modal-content-header">
            <h2>{formatMessage({ id: 'forget-this-server' })}</h2>
          </div>
          <div className="modal-content-body">
            {formatMessage({ id: 'confirm-forget-server' })}</div>
          <div className="modal-content-footer">
            <ul onClick={() => setForgetPrompted(false)} className="buttons-row">
              <li>
                <button className="btn btn-error">
                  {formatMessage({ id: 'cancel' })}
                </button>
              </li>

              <li>
                <button onClick={onForget} className="btn btn-primary">
                  {formatMessage({ id: 'forget-this-server' })}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
}

ServerSelect.contextTypes = {
  intl: PropTypes.object,
}

export default ServerSelect;