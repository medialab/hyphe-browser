import './RedirectionModal.styl'
import React, { useState, useMemo, useEffect } from 'react'
import Modal from 'react-modal'
import PrefixSetter from '../../components/PrefixSetter'
import cx from 'classnames'
import dropRightWhile from 'lodash/fp/dropRightWhile'
import initial from 'lodash/fp/initial'

import { urlToLru, lruVariations, longestMatching, lruToUrl, lruObjectToString } from '../../utils/lru'
import { set } from 'lodash/fp'

Modal.setAppElement('#root')

const parsePrefixes = (lru, url, newEntity, tldTree) => {
  const urlLru = lruObjectToString(urlToLru(url, tldTree))
  const l = lru.split('|').length
  return dropRightWhile((stem) => stem === 'p:', initial(urlLru.split('|'))).map((stem, index) => {
    const editable = newEntity ? index >= l : index >= l - 1
    return {
      name: stem,
      editable,
      selected: index < l - 1 || newEntity,
    }
  })
}

const MergeReverse = ({
  webentity,
  url,
  tlds,
  originalWebentity,
  onSetPrefixes
}) => {

  const longestLru = useMemo(
    () => longestMatching(webentity.prefixes, url, tlds).lru,
    [webentity.prefixes, url, tlds]
  )
  const prefixes = useMemo(
    () => parsePrefixes(lruObjectToString(longestLru), url, true, tlds),
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

  useEffect(() => {
    onSetPrefixes(lruVariations(initialPrefix))
  },[])

  return (
    <div>
      <p>Choose which part of <strong>{ webentity.name }</strong> (<code>{prefixUrl}</code>) you want to merge into <strong>{ originalWebentity.name }</strong>:</p>
      <PrefixSetter
        parts={ prefixes }
        setPrefix={ handleSetPrefix }
      />
    </div>
  )
}
const RedirectionModal = ({
  isOpen,
  // onClose,
  mergeRequired,
  tlds,
  onValidateDecision
}) => {
  const { redirectUrl, originalWebentity, redirectWebentity } = mergeRequired

  const [redirectionDecision, onSetRedirectionDecision] = useState(null)
  const [mergeDecision, onSetMergeDecision] = useState(null)
  const [lruPrefixes, setLruPrefixes] = useState(null)

  const handleDeny = () => {
    onSetRedirectionDecision(false)
    onSetMergeDecision(null)
  }

  const handleDecision = () => {
    onValidateDecision({
      redirectionDecision,
      mergeDecision,
      prefixes: lruPrefixes
    })
  }

  return (
    <Modal
      isOpen={ isOpen }
      // onRequestClose={ onClose }
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
            {/* <i onClick={ onClose } className="ti-close" /> */}
          </h2>
        </div>
        <div className="modal-body">
          <div className="explanation-text">
            The webpage <code>{originalWebentity.homepage}</code> (which belongs to webentity <strong>{originalWebentity.name}</strong>) wants to redirect the browser to the webpage <code>{redirectUrl}</code> (which belongs to webentity <strong>{redirectWebentity.name}</strong>)
          </div>

          <div className={ cx('step-container') }>
            <h3>What should we do regarding this redirection?</h3>
            <ul className="actions-container big">
              <li><button onClick={ handleDeny } className={ cx('btn', { 'btn-success': redirectionDecision === false }) }>refuse it and stay there</button></li>
              <li><button onClick={ () => onSetRedirectionDecision(true) }  className={ cx('btn', { 'btn-success': redirectionDecision === true }) }>accept it</button></li>
            </ul>
          </div>
          {
            redirectionDecision === true &&
            <div className={ cx('step-container') }>
              <h3>What should we do with the two webentities?</h3>
              <ul className="actions-container big column">
                <li><button onClick={ () => onSetMergeDecision('OUT') } className={ cx('btn', { 'btn-success': mergeDecision === 'OUT' }) }>put <strong>{ originalWebentity.name }</strong> into the OUT list</button></li>
                <li><button  onClick={ () => onSetMergeDecision('MERGE') } className={ cx('btn', { 'btn-success': mergeDecision === 'MERGE' }) }>merge <strong>{ originalWebentity.name }</strong> into <strong>{redirectWebentity.name}</strong> </button></li>
                {longestMatching(redirectWebentity.prefixes, redirectUrl, tlds) &&
                  <li>
                    <button  onClick={ () => onSetMergeDecision('MERGE-REVERSE') } className={ cx('btn', { 'btn-success': mergeDecision === 'MERGE-REVERSE' }) }>merge a part of <strong>{ redirectWebentity.name }</strong> into <strong>{ originalWebentity.name }</strong> </button>
                  </li>
                }
              </ul>
              {mergeDecision === 'MERGE-REVERSE' &&
                <MergeReverse
                  webentity={ redirectWebentity }
                  originalWebentity={ originalWebentity }
                  url={ redirectUrl }
                  tlds={ tlds }
                  onSetPrefixes={ setLruPrefixes }
                />
              }
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
                className="btn btn-success">confirm this decision</button>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default RedirectionModal
