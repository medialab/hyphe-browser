import './RedirectionModal.styl'
import React, { useState, useMemo } from 'react'
import Modal from 'react-modal'
import PrefixSetter from '../../components/PrefixSetter'
import cx from 'classnames'
import dropRightWhile from 'lodash/fp/dropRightWhile'
import initial from 'lodash/fp/initial'

import { urlToLru, lruVariations, longestMatching, lruToUrl, lruObjectToString } from '../../utils/lru'

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
  const [lruPrefixes, setLruPrefixes] = useState(redirectWebentity.prefixes)

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
  const handleSetPrefix = (prefix) => {
    setPrefixUrl(lruToUrl(prefix))
    setLruPrefixes(lruVariations(prefix))
  }

  const longestLru = useMemo(
    () => longestMatching(redirectWebentity.prefixes, redirectUrl, tlds).lru,
    [redirectWebentity.prefixes, redirectUrl, tlds]
  )
  const prefixes = useMemo(
    () => parsePrefixes(lruObjectToString(longestLru), redirectUrl, true, tlds),
    [longestLru, redirectUrl, tlds]
  )

  const initialPrefix = useMemo(
    () => prefixes
      .filter(({ selected }) => selected)
      .reduce((prev, part) => `${prev}${part.name}|`, '')
  )

  const [prefixUrl, setPrefixUrl] = useState(lruToUrl(initialPrefix))


  // const longestLru = longestMatching(redirectWebentity.prefixes, redirectUrl, tlds).lru
  // const prefixes = parsePrefixes(lruObjectToString(longestLru), redirectUrl, true, tlds)

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
            The webpage <code>{originalWebentity.homepage}</code> (belonging to webentity <strong>{originalWebentity.name}</strong>) wants to redirect the browser to the webpage <code>{redirectUrl}</code> (belonging to webentity <strong>{redirectWebentity.name}</strong>)
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
              <h3>What should we do with the source with the two webentities ?</h3>
              <ul className="actions-container big column">
                <li><button onClick={ () => onSetMergeDecision('OUT') } className={ cx('btn', { 'btn-success': mergeDecision === 'OUT' }) }>move <strong>{ originalWebentity.name }</strong> webentity to OUT list</button></li>
                <li><button  onClick={ () => onSetMergeDecision('MERGE') } className={ cx('btn', { 'btn-success': mergeDecision === 'MERGE' }) }>merge <strong>{ originalWebentity.name }</strong>  within the <strong>{redirectWebentity.name}</strong> </button></li>
                <li>
                  <button  onClick={ () => onSetMergeDecision('MERGE-REVERSE') } className={ cx('btn', { 'btn-success': mergeDecision === 'MERGE-REVERSE' }) }>merge <strong>{ redirectWebentity.name }</strong>  within the <strong>{ originalWebentity.name }</strong> </button>
                </li>
              </ul>
              {mergeDecision === 'MERGE-REVERSE' &&
                <div>
                  <p>Choose the level of prefix (<code>{prefixUrl}</code>) to add to <strong>{ originalWebentity.name }</strong>:</p>
                  <PrefixSetter
                    parts={ prefixes }
                    setPrefix={ handleSetPrefix }
                  />
                </div>}
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