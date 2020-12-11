import './LinkedWebentities.styl'

import { FormattedMessage as T, useIntl } from 'react-intl'

import React, {useEffect, useState, useMemo} from 'react'
import cx from 'classnames'

import HelpPin from '../HelpPin'
import EntityCard from '../EntityCard'
import CardsList from '../CardsList'
import DownloadListBtn from '../DownloadListBtn'
import MergeActionsModal from './MergeActionsModal'
import { filter } from 'lodash'

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

  const selectedListCount = webentity[(linkedEntities === 'referrers' ? 'in' : 'out') + 'degree']

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

  const filteredList = linkedEntitiesList.filter((entity) => entity.status === 'IN' || entity.status === 'UNDECIDED')

  return (
    <div className={ cx('linked-entities', { 'is-loading': loadingBatchActions }) }>
      <div className="main-wrapper">
        {
          selectedListCount !== filteredList.length &&
          <div className="actualize-container">
            <button className="btn actualize" onClick={ handleUpdateList }>
              {formatMessage({ id: 'actualize-entities-list' })}
              {` (${selectedListCount > filteredList.length ? `+${selectedListCount - filteredList.length}` : `-${ filteredList.length  - selectedListCount }`})`}
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
