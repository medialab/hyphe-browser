import './EntityExistsModal.styl'
import React from 'react'
import Modal from 'react-modal'

Modal.setAppElement('#root')

const EntityExistsModal = ({
}) => {

  return (
    <Modal
      isOpen
      contentLabel="New entity modal"
      style={ {
        content: {
          width: 700,
          maxWidth: '90vw',
          position: 'relative',
          top: 0,
          left: 0,
          overflow: 'hidden',
          padding: 0
        }
      } }
    >
      <div className="new-entity-modal-container">
        <div className="modal-header">
          <h2><span>Entity URL scope already exists</span><i className="ti-close" /></h2>
        </div>
        <div className="modal-body">
          <div className="explanation-text">
              The URL scope you have defined for this new entity already exists.
          </div>
        </div>
        <div className="modal-footer">
          <ul className="actions-container big">
            <li><button className="btn btn-danger">cancel</button></li>
            <li><button className="btn btn-success">navigate to existing entity</button></li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default EntityExistsModal