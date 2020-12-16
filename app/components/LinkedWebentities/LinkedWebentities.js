import './LinkedWebentities.styl'

import { FormattedMessage as T, useIntl } from 'react-intl'

import React, { useEffect, useState } from 'react'
import cx from 'classnames'

import EntityCard from '../EntityCard'
import CardsList from '../CardsList'
import DownloadListBtn from '../DownloadListBtn'
import MergeActionsModal from './MergeActionsModal'

const LinkedWebentities = ({
  webentity,
  tlds,
  linkedEntities,
  linkedEntitiesList,
  viewedSuggestionIds,
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

  const [stateList, setStateList] = useState(linkedEntitiesList)
  const [mergeActions, setMergeActions] = useState([])

  useEffect(() => {
    setStateList(linkedEntitiesList)
  }, [linkedEntitiesList])

  const degreeCount = webentity[(linkedEntities === 'referrers' ? 'in' : 'out') + 'degree']

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

  const handleUpdateList = () => updateList(linkedEntities)

  const handleDownloadList = () => {
    onDownloadList(linkedEntities)
  }

  const filteredList = linkedEntities === 'referrers' && stateList.filter((entity) => entity.status === 'IN' || entity.status === 'UNDECIDED')

  return (
    <div className={ cx('linked-entities', { 'is-loading': loadingBatchActions }) }>
      <div className="main-wrapper">
        {
          // show actualize button of referrals and during webentity is crawling
          degreeCount !== stateList.length && webentity.status === 'IN' && linkedEntities === 'referrals' && webentity.crawling_status === 'RUNNING' &&
          <div className="actualize-container">
            <button className="btn actualize" onClick={ handleUpdateList }>
              {formatMessage({ id: 'actualize-entities-list' })}
              {` (${degreeCount > stateList.length ? `+${degreeCount - stateList.length}` : `-${ stateList.length  - degreeCount }`})`}
            </button>
          </div>
        }
        {
          // show actualize button of referrers compared with filteredList
          linkedEntities === 'referrers' &&  filteredList && degreeCount !== filteredList.length &&
          <div className="actualize-container">
            <button className="btn actualize" onClick={ handleUpdateList }>
              {formatMessage({ id: 'actualize-entities-list' })}
              {` (${degreeCount > filteredList.length ? `+${degreeCount - filteredList.length}` : `-${ filteredList.length  - degreeCount }`})`}
            </button>
          </div>
        }
        <CardsList>
          { stateList.length ? stateList.map((link, index) => {
            const toggleAction = (obj, key, status) => {
              return {
                ...obj,
                [key]: obj[key] && obj[key].status === status ? null : { prevStatus: link.status, status }
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
                isMergeActive={ statusActions[link.id] && statusActions[link.id].status === 'MERGE' }
                isUndecidedActive={ statusActions[link.id] && statusActions[link.id].status === 'UNDECIDED' }
                isOutActive={ statusActions[link.id] && statusActions[link.id].status === 'OUT' }
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
                <T id="discard-decisions" />
              </button>
            </li>
            <li onClick={ handleSubmitActions }><button className="btn confirm-btn">
              <T id="apply-decisions" values={ { count: pendingActions.length } } />
            </button></li>
          </ul>
        }

        { stateList.length > 0 && (!pendingActions || pendingActions.length === 0) &&
          <div className="download">
            <DownloadListBtn onClickDownload={ handleDownloadList } />
          </div>
        }
      </div>
      {
        mergeActions.length > 0 &&
        <MergeActionsModal
          isOpen
          mergeActions={ mergeActions }
          linkedList={ webentity[linkedEntities] }
          tlds={ tlds }
          webentityName={ webentity.name }
          onClose={ handleCloseMergeModal }
          onValidateMerge={ handleValidateMerge }
        />
      }
    </div>
  )
}

export default React.memo(LinkedWebentities)
