import './MergeActionsModal.styl'

import React, { useState, useMemo, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'react-modal'
import PrefixSetter from '../../components/PrefixSetter'

import { lruVariations, longestMatching, lruToUrl, lruObjectToString, parsePrefixes } from '../../utils/lru'

Modal.setAppElement('#root')


const MergePrefix = ({
  webentity,
  url,
  tlds,
  mergePart,
  onCancel,
  onSetPrefixes
}) => {
  const longestLru = useMemo(
    () => longestMatching(webentity.prefixes, url, tlds) && longestMatching(webentity.prefixes, url, tlds).lru,
    [webentity.prefixes, url, tlds]
  )
  const prefixes = useMemo(
    () => parsePrefixes(lruObjectToString(longestLru), url, mergePart, tlds),
    [longestLru, url, tlds]
  )

  const initialPrefix = useMemo(
    () => prefixes
      .filter(({ selected }) => selected)
      .reduce((prev, part) => `${prev}${part.name}|`, '')
  )

  const handleSetPrefix = (prefix) => {
    setPrefixUrl(lruToUrl(prefix))
    onSetPrefixes(lruVariations(prefix))
  }

  const [prefixUrl, setPrefixUrl] = useState(lruToUrl(initialPrefix))

  // update prefixUrl if initialPrefixes changed
  useEffect(() => {
    setPrefixUrl(lruToUrl(initialPrefix))
  }, [initialPrefix])

  // initialize prefixes
  useEffect(() => {
    onSetPrefixes(webentity.id, lruVariations(initialPrefix))
  },[])

  return (
    <>
      <div className="prefix-input-container">
        <PrefixSetter
          webentityId={ webentity.id }
          parts={ prefixes }
          setPrefix={ handleSetPrefix }
        />
        <ul className="actions-container">
          <li>
            <button
              onClick={ onCancel }
              className='btn btn-danger'
            ><FormattedMessage id="merge-actions-modal.remove-item" /></button></li>
        </ul>
      </div>

      <code>{prefixUrl}</code>
    </>
  )
}

const MergeModal = ({
  isOpen,
  mergeActions,
  linkedList,
  tlds,
  onClose,
  onValidateMerge,
}) => {
  const [currentMergeActions, setCurrentMergeActions] = useState(mergeActions)
  const [mergePrefixes, setMergePrefixes] = useState({})

  const handleValidateMerge = () => {
    onValidateMerge(currentMergeActions.map((action) => {
      return {
        ...action,
        prefixes: mergePrefixes[action.id]
      }
    })
    )
  }
  const handleSetPrefixes = (id, prefixes) => {
    setMergePrefixes((mergePrefixes) => {
      return {
        ...mergePrefixes,
        [id]: prefixes
      }
    })
  }

  const handleCancelMerge = (id) => {
    setCurrentMergeActions((actions) => actions.filter((action) => action.id !== id))
  }

  return (
    <Modal
      isOpen={ isOpen }
      // onRequestClose={ onClose }
      contentLabel="Merge Actions Modal"
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
          <h2><FormattedMessage id="merge-actions-modal.title" /></h2>
        </div>
        <div className="modal-body">
          <div className="explanation-text">
            <FormattedMessage id="merge-actions-modal.description" />
          </div>
          <ul>
            {
              mergeActions.map((action, id) => {
                const webentity  = linkedList.find((webentity) => webentity.id === action.id)
                const cancelMerge = () => handleCancelMerge(action.id)
                if (!webentity) return null
                const isCanceledAction = currentMergeActions.findIndex((currentAction) => currentAction.id === webentity.id) === -1
                return (
                  <li
                    style={ { display: isCanceledAction && 'none' } }
                    key={ id }
                    className="step-container"
                  >
                    <MergePrefix
                      webentity={ webentity }
                      url={ webentity.homepage }
                      tlds={ tlds }
                      mergePart={ false }
                      onCancel={ cancelMerge }
                      onSetPrefixes={ handleSetPrefixes }
                    />
                  </li>
                )
              })
            }
          </ul>
        </div>
        <div className="modal-footer">
          <ul className="actions-container big">
            <li><button onClick={ onClose } className="btn btn-danger">cancel</button></li>
            {
              currentMergeActions.length > 0 &&
              <li>
                <button
                  onClick={ handleValidateMerge }
                  className="btn btn-success"
                >
                  <FormattedMessage id="merge-actions-modal.confirm" values={ { count: currentMergeActions.length } } />
                </button>
              </li>
            }
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default MergeModal
