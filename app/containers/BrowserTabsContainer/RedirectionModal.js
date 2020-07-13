import './RedirectionModal.styl'
import React, { useState } from 'react'
import Modal from 'react-modal'
import cx from 'classnames'

Modal.setAppElement('#root')

const RedirectionModal = ({
  isOpen,
  mergeRequired,
  onValidateDecision
}) => {
  const { originalUrl, redirectUrl, originalWebentity, redirectWebentity } = mergeRequired

  const [redirectionDecision, onSetRedirectionDecision] = useState(null)
  const [mergeDecision, onSetMergeDecision] = useState(null)

  const handleDeny = () => {
    onSetRedirectionDecision(false)
    onSetMergeDecision(null)
  }

  const handleDecision = () => {
    onValidateDecision({
      redirectionDecision,
      mergeDecision
    })
  }

  return (
    <Modal
      isOpen={ isOpen }
      contentLabel="Redirection modal"
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
          <h2><span>This page requests a redirection</span>
          {/*<i onClick={ onToggle } className="ti-close" />*/}
          </h2>
        </div>
        <div className="modal-body">
          <div className="explanation-text">
            The webpage <code>{originalUrl}</code> (belonging to webentity <strong>{originalWebentity.name}</strong>) wants to redirect the browser to the webpage <code>{redirectUrl}</code> (belonging to webentity <strong>{redirectWebentity.name}</strong>)
          </div>

          <div className={ cx('step-container') }>
            <h3>What should we do regarding the redirection ?</h3>
            <ul className="actions-container big">
              <li><button onClick={ handleDeny } className={ cx('btn', { 'btn-success': redirectionDecision === false }) }>deny redirection</button></li>
              <li><button onClick={ () => onSetRedirectionDecision(true) }  className={ cx('btn', { 'btn-success': redirectionDecision === true }) }>accept redirection</button></li>
            </ul>
          </div>
          {
            redirectionDecision === true &&
            <div className={ cx('step-container') }>
              <h3>What should we do with the source of the redirection ("{ originalUrl }") ?</h3>
              <ul className="actions-container big">
                <li><button onClick={ () => onSetMergeDecision('OUT') } className={ cx('btn', { 'btn-success': mergeDecision === 'OUT' }) }>put it into OUT list</button></li>
                <li><button  onClick={ () => onSetMergeDecision('MERGE') } className={ cx('btn', { 'btn-success': mergeDecision === 'MERGE' }) }>merge it with the redirection destination webentity</button></li>
              </ul>
            </div>
          }
        </div>
        <div className="modal-footer">
          <ul className="actions-container big">
            {/* <li><button className="btn btn-danger">cancel</button></li> */}
            <li>
              <button
                onClick={ handleDecision }
                disabled={ redirectionDecision === null || redirectionDecision && !mergeDecision }
                className="btn btn-success">validate this decision</button>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default RedirectionModal