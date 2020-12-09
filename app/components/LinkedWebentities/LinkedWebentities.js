import './LinkedWebentities.styl'

import { FormattedMessage as T, useIntl } from 'react-intl'

import React, {useEffect, useState} from 'react'
import cx from 'classnames'

import HelpPin from '../HelpPin'
import EntityCard from '../EntityCard'
import CardsList from '../CardsList'
import DownloadListBtn from '../DownloadListBtn'
import MergeActionsModal from './MergeActionsModal'

const LinkedWebentities = ({
  webentity,
  tlds,
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
  updateList,
  onOpenTab,
  onDownloadList
}) => {
  const { formatMessage } = useIntl()

  const [stateList, setStateList] = useState(list)
  const [mergeActions, setMergeActions] = useState([])

  useEffect(() => {
    setStateList(list)
  }, [list])

  const selectedListCount = webentity[(selected === 'referrers' ? 'in' : 'out') + 'degree']


  const handleCloseMergeModal = () => {
    setMergeActions([])
  }

  const handleValidateMerge = (mergeActions) => {
    submitActions(mergeActions)
    const newList = [...stateList]
    mergeActions.forEach((action) => {
      newList.forEach((entity) => {
        if(entity.id === action.id) {
          entity.previousStatus = entity.status
          entity.status = action.type
        }
      })
    })
    setStateList(newList)
    setMergeActions([])
  }

  const handleSubmitActions = () => {
    const nonMergeActions = pendingActions.filter((action) => action.type !== 'MERGE')
    setMergeActions(pendingActions.filter((action) => action.type === 'MERGE'))
    const newList = [...stateList]
    nonMergeActions.forEach((action) => {
      newList.forEach((entity) => {
        if(entity.id === action.id) {
          entity.previousStatus = entity.status
          entity.status = action.type
        }
      })
    })
    setStateList(newList)
    submitActions(nonMergeActions)
  }

  const hanldeUpdateList = () => updateList(selected)

  const handleDownloadList = () => {
    onDownloadList(selected)
  }
  return (
    <div>
      <div className={ cx('linked-entities', { 'is-loading': loadingBatchActions }) }>
        <nav className="list-toggle">
          {
            ['referrers', 'referrals'].map((l, index) => {
              const handleSelectContextualList = () => {
                setSelected(l)
                resetActions()
              }
              const count = webentity[(l === 'referrers' ? 'in' : 'out') + 'degree']

              return (
                <button
                  className={ cx('btn', 'btn-default', 'navigation', { 'is-selected': l === selected }) }
                  key={ index }
                  onClick={ handleSelectContextualList }
                >
                  <span className="list-toggle-title">
                    <T id={ `sidebar.contextual.${l}` } values={ { count } } />
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
          {
            selectedListCount !== stateList.length &&
            <div className="actualize-container">
              <button className="btn actualize" onClick={ hanldeUpdateList }>
                {formatMessage({ id: 'actualize-entities-list' })}
                {` (${selectedListCount > stateList.length ? `+${selectedListCount - stateList.length}` : `-${ stateList.length  - selectedListCount }`})`}
              </button>
            </div>
          }
          <CardsList>
            { stateList.length ? stateList.map((link, index) => {
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
              <li onClick={ handleSubmitActions }><button className="btn confirm-btn">
                <T id="apply-decisions" values={ { count: pendingActions.length } } />
              </button></li>
            </ul>
          }

          { stateList.length > 0 &&
            <div className="download">
              <DownloadListBtn onClickDownload={ handleDownloadList } />
            </div>
          }
        </div>
      </div>
      {
        mergeActions.length > 0 &&
        <MergeActionsModal
          isOpen
          tlds={ tlds }
          mergeActions={ mergeActions }
          linkedList={ webentity[selected] }
          onClose={ handleCloseMergeModal }
          onValidateMerge={ handleValidateMerge }
        />
      }
    </div>
  )
}

export default LinkedWebentities
