import './LinkedWebentities.styl'

import { FormattedMessage as T, useIntl } from 'react-intl'

import React from 'react'
import cx from 'classnames'

import HelpPin from '../HelpPin'
import EntityCard from '../EntityCard'
import CardsList from '../CardsList'
import DownloadListBtn from '../DownloadListBtn'

const LinkedWebentities = ({
  setSelected,
  selected,
  viewedSuggestionIds,
  list,
  loadingBatchActions,
  resetActions,
  submitActions,
  pendingActions,
  statusActions,
  setStatusActions,
  onOpenTab,
  onDownloadList
}) => {
  const { formatMessage } = useIntl()
  const handleDownloadList = () => {
    onDownloadList(selected)
  }
  return (
    <div>
      <div className={ cx('linked-entities', { 'is-loading': loadingBatchActions }) }>
        <nav className="list-toggle">
          {
            // hide parents and children tabs for now
            ['referrers', 'referrals'].map((l, index) => {
              const handleSelectContextualList = () => {
                setSelected(l)
                resetActions()
              }
              return (
                <button
                  className={ cx('btn', 'btn-default', 'navigation', { 'is-selected': l === selected }) }
                  key={ index } 
                  onClick={ handleSelectContextualList }
                >
                  <span className="list-toggle-title">
                    <T id={ `sidebar.contextual.${l}` } />
                  </span>
                  <HelpPin>
                    {formatMessage({ id: `sidebar.contextual.${l}-help` })}
                  </HelpPin>
                </button>
              )
            }
            ) }
        </nav>
        <div className="main-wrapper">
          <CardsList>
            { list.length ? list.map((link, index) => {

              const toggleAction = (obj, key, status) => {
                return {
                  ...obj,
                  [key]: obj[key] === status ? null : status
                }
              }

              const handleClickLink = () => onOpenTab(link.homepage)
              const handleClickMerge = (e) => {
                e.stopPropagation()
                setStatusActions(toggleAction(statusActions, link.id, 'MERGE'))
              }
              const handleClickOut = (e) => {
                e.stopPropagation()
                setStatusActions(toggleAction(statusActions, link.id, 'OUT'))
              }
              const handleClickUndecided = (e) => {
                e.stopPropagation()
                setStatusActions(toggleAction(statusActions, link.id, 'UNDECIDED'))
              }

              const isViewed = link.status === 'DISCOVERED' && viewedSuggestionIds && viewedSuggestionIds.has(link.id)
                            
              return (
                <EntityCard 
                  key={ index }
                  allowMerge
                  link={ link }
                  isViewed={ isViewed }
                  onClickLink={ handleClickLink } 
                  onClickMerge={ handleClickMerge }
                  onClickOut={ handleClickOut }
                  onClickUndecided={ handleClickUndecided }
                  isMergeActive={ statusActions[link.id] === 'MERGE' }
                  isUndecidedActive={ statusActions[link.id] === 'UNDECIDED' }
                  isOutActive={ statusActions[link.id] === 'OUT' }
                />
              )
            })
              : <div className="empty-indicator">
                { formatMessage({ id: 'none' }) }
              </div>
            }
          </CardsList>
          
          {
            pendingActions && pendingActions.length > 0
            &&
            <ul className="actions-container">
              <li onClick={ resetActions } >
                <button className="btn cancel-btn">
                  <T id="discard-decisions" values={ { count: pendingActions.length } } />
                </button>
              </li>
              <li onClick={ submitActions }><button className="btn confirm-btn">
                <T id="apply-decisions" values={ { count: pendingActions.length } } />
              </button></li>
            </ul>
          }
                      
          { list.length > 0 &&
            <div className="download">
              <DownloadListBtn onClickDownload={ handleDownloadList } />
            </div>
          }
        </div>               
      </div>
    </div>
  )
}

export default LinkedWebentities
