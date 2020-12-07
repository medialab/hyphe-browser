import './RedirectionModal.styl'
import React, { useState, useMemo, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'

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

const MergePrefix = ({
  webentity,
  url,
  tlds,
  originalWebentity,
  mergePart,
  onSetPrefixes
}) => {

  const longestLru = useMemo(
    () => longestMatching(webentity.prefixes, url, tlds).lru,
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

  useEffect(() => {
    onSetPrefixes(lruVariations(initialPrefix))
  },[])

  return (
    <div>
      <p>
        <FormattedMessage
          id="redirect-modal.step-2-merge-part-description"
          values={ {
            webentity: webentity.name,
            originalWebentity: originalWebentity.name,
            url: prefixUrl,
            code: (url) => <code>{url}</code>,
            strong: (name) => <strong>{name}</strong>
          } }
        />
      </p>
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
          <h2><span><FormattedMessage id="redirect-modal.title" /></span>
            {/* <i onClick={ onClose } className="ti-close" /> */}
          </h2>
        </div>
        <div className="modal-body">
          <div className="explanation-text">
            <FormattedMessage
              id="redirect-modal.description"
              values={ {
                originalUrl: originalWebentity.tabUrl || originalWebentity.homepage,
                originalWebentity: originalWebentity.name,
                redirectUrl,
                redirectWebentity: redirectWebentity.name,
                code: (url) => <code>{url}</code>,
                strong: (name) => <strong>{name}</strong>
              } }
            />
          </div>

          <div className={ cx('step-container') }>
            <h3><FormattedMessage id="redirect-modal.step-1-title" /></h3>
            <ul className="actions-container big">
              <li><button onClick={ handleDeny } className={ cx('btn', { 'btn-success': redirectionDecision === false }) }><FormattedMessage id="redirect-modal.step-1-refuse" /></button></li>
              <li><button onClick={ () => onSetRedirectionDecision(true) }  className={ cx('btn', { 'btn-success': redirectionDecision === true }) }><FormattedMessage id="redirect-modal.step-1-accept" /></button></li>
            </ul>
          </div>
          {
            redirectionDecision === true &&
            <div className={ cx('step-container') }>
              <h3><FormattedMessage id="redirect-modal.step-2-title" /></h3>
              <ul className="actions-container big column">
                {/* <li>
                  <button onClick={ () => onSetMergeDecision('MERGE') } className={ cx('btn', { 'btn-success': mergeDecision === 'MERGE' }) }>
                    <FormattedMessage
                      id="redirect-modal.step-2-merge"
                      values={ {
                        originalWebentity: originalWebentity.name,
                        redirectWebentity: redirectWebentity.name,
                        strong: (name) => <strong>{name}</strong>
                      } }
                    />
                  </button>
                </li> */}
                <li>
                  <button onClick={ () => onSetMergeDecision('MERGE-PART') } className={ cx('btn', { 'btn-success': mergeDecision === 'MERGE-PART' }) }>
                    <FormattedMessage
                      id="redirect-modal.step-2-merge-part"
                      values={ {
                        originalWebentity: originalWebentity.name,
                        redirectWebentity: redirectWebentity.name,
                        strong: (name) => <strong>{name}</strong>
                      } }
                    />
                  </button>
                </li>
                {longestMatching(redirectWebentity.prefixes, redirectUrl, tlds) &&
                  <li>
                    <button onClick={ () => onSetMergeDecision('MERGE-REVERSE') } className={ cx('btn', { 'btn-success': mergeDecision === 'MERGE-REVERSE' }) }>
                      <FormattedMessage
                        id="redirect-modal.step-2-merge-reverse"
                        values={ {
                          originalWebentity: originalWebentity.name,
                          redirectWebentity: redirectWebentity.name,
                          strong: (name) => <strong>{name}</strong>
                        } }
                      />
                    </button>
                  </li>
                }
                <li>
                  <button onClick={ () => onSetMergeDecision('OUT') } className={ cx('btn', { 'btn-success': mergeDecision === 'OUT' }) }>
                    <FormattedMessage
                      id="redirect-modal.step-2-out"
                      values={ {
                        originalWebentity: originalWebentity.name,
                        strong: (name) => <strong>{name}</strong>
                      } }
                    />
                  </button>
                </li>
                <li>
                  <button onClick={ () => onSetMergeDecision('NONE') } className={ cx('btn', { 'btn-success': mergeDecision === 'NONE' }) }>
                    <FormattedMessage
                      id="redirect-modal.step-2-no-action"
                      values={ {
                        strong: (name) => <strong>{name}</strong>
                      } }
                    />
                  </button>
                </li>
              </ul>
              {mergeDecision === 'MERGE-PART' &&
                <MergePrefix
                  webentity={ originalWebentity }
                  originalWebentity={ redirectWebentity }
                  url={ originalWebentity.tabUrl }
                  tlds={ tlds }
                  mergePart={ false }
                  onSetPrefixes={ setLruPrefixes }
                />
              }
              {mergeDecision === 'MERGE-REVERSE' &&
                <MergePrefix
                  webentity={ redirectWebentity }
                  originalWebentity={ originalWebentity }
                  url={ redirectUrl }
                  tlds={ tlds }
                  mergePart={ false }
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
                className="btn btn-success"
              >
                <FormattedMessage id="redirect-modal.confirm" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default RedirectionModal
