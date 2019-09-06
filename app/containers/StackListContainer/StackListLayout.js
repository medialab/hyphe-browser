import './StackListLayout.styl'

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { FormattedMessage as T, intlShape } from 'react-intl'

import { pickBy } from 'lodash'

import EntityCard from '../../components/EntityCard'
import DownloadListBtn from '../../components/DownloadListBtn'
import EditionCartel from '../../components/EditionCartel'
import HelpPin from '../../components/HelpPin'
import { USED_STACKS } from '../../constants'
import { formatCounter } from '../../utils/misc'
import Spinner from '../../components/Spinner'

import WebentitiesContainer from './WebentitiesContainer'

const StackListLayout = ({
  counters,
  selectedStack,
  stackFilter,
  stackWebentities,
  tabWebentity,
  loadingStack,
  loadingBatchActions,
  onSelectStack,
  onBatchActions,
  onLoadNextPage,
  onDownloadList,
  onSelectWebentity,
}, { intl }) => {
  const { formatMessage } = intl

  const [isFilterOpen, setFilterOpen] = useState(false)
  const [filterValue, setFilterValue] = useState(stackFilter)
  const [selectedList, setSelectedListReal] = useState(selectedStack)
  const [isOpen, setOpen] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [isLocating, setIsLocating] = useState(undefined)

  useEffect(() => {
    setSelectedListReal(selectedStack)
  }, [selectedStack])

  useEffect(() => {
    setFilterValue(stackFilter)
  }, [stackFilter])

  const [statusActions, setStatusActions] = useState({})

  const pendingActions = Object.keys(pickBy(statusActions, v => v)).map((key) => {
    return {
      id: +key,
      type: pickBy(statusActions, v => v)[key]
    }
  })
  const resetActions = () => {
    setStatusActions({})
  }

  const submitActions = () => {
    onBatchActions(pendingActions, selectedStack)
    resetActions()
  }

  const setSelectedList = l => {
    if (l === selectedStack) {
      setOpen(!isOpen)
    } else {
      setSelectedListReal(l)
      onSelectStack(l, filterValue)
      setOpen(false)
    }
    resetActions()
  }
  const handleSearch = (e) => setSearchString(e.target.value)

  const handleSelectFilter = (value) => {
    let newValue = value
    if (filterValue === value) {
      newValue = null
    }
    onSelectStack(selectedStack, newValue)
    setFilterValue(newValue)
    setFilterOpen(false)
  }
  const handleLoadNextPage = () => {
    const { token, next_page } = stackWebentities[selectedStack]
    onLoadNextPage(selectedStack, token, next_page)
  }

  const handleDownloadList = () => {
    const filteredList =
      stackWebentities[selectedStack].webentities
        .filter((webentity) => {
          if (searchString.length) {
            return JSON.stringify(webentity).toLowerCase().indexOf(searchString.toLowerCase()) > -1
          }
          return true
        })
    onDownloadList(filteredList)
  }

  const isEmpty = counters[selectedList] === 0
  const isLoading = loadingBatchActions || loadingStack
  const stackInfo = USED_STACKS.find((stack) => stack.id === selectedStack)
  const handleLocate = () => {
    if (tabWebentity.status !== selectedStack) {
      onSelectStack(tabWebentity.status)
    }
    setIsLocating(tabWebentity.id)
  }
  const handleLocateSuccess = () => {
    setIsLocating(undefined)
  }
  return (
    <div className="list-layout">
      <div className="status-list-container">
        <EditionCartel
          isAlwaysOpen
          title={formatMessage({ id: 'sidebar.overview.current-webentities-list' })}
          help={formatMessage({ id: 'sidebar.overview.current-webentities-list-help' })}
        >
          <div className={cx('status-list', { 'is-open': isOpen })}>
            <ul className={cx('webentities-list-of-lists')}>
              {
                USED_STACKS.map((stack, index) => {
                  const handleSelectList = () => {
                    setSelectedList(stack.id)
                  }
                  return (
                    <li key={index} onClick={handleSelectList} className={'list-name-container ' + (selectedList === stack.id ? 'is-active' : '')}>
                      <span className="list-btn-container">
                        <button className={`list-btn ${stack.value}`}>
                          <T id={`stack-status.${stack.id}`} />
                          <HelpPin>
                            {formatMessage({ id: `stack-status.help.${stack.id}` })}
                          </HelpPin>
                        </button>
                      </span>
                      <span className="count">
                        <span>{formatCounter(counters[stack.id])}</span>
                      </span>
                    </li>
                  )
                })
              }
            </ul>
            <button onClick={() => setOpen(!isOpen)} className="status-list-toggle">
              <i className={isOpen ? 'ti-angle-up' : 'ti-angle-down'} />
            </button>
          </div>
        </EditionCartel>

      </div>
      <div className="webentities-list-wrapper">

        <div className="webentities-list-container">
          <div className={cx('webentities-list-header', { 'is-disabled': isEmpty })}>
            <input
              placeholder={formatMessage({ id: 'sidebar.overview.search-a-webentity' })}
              value={searchString}
              onChange={handleSearch} />
            <span className={cx('filter-container', { 'is-active': isFilterOpen, 'has-filters': !!filterValue })}>
              <button onClick={() => setFilterOpen(!isFilterOpen)} className="filter">
                <T id="filter" /> <i className="ti-angle-down" />
              </button>
              {
              tabWebentity &&
              <button onClick={handleLocate} className={cx("btn locate", tabWebentity.status)}>
                <T id="locate-currently-browsed-webentity" />
                <HelpPin>
                  {formatMessage({id: 'locate-currently-browsed-webentity-help'})}
                </HelpPin>
              </button>
              }
              {isFilterOpen &&
                <ul className="filter-options">
                  <li className={cx('filter-option', { 'is-active': filterValue === 'no-tag' })} onClick={() => handleSelectFilter('no-tag')}><T id="sidebar.overview.show-only-no-tags" /></li>
                  <li className={cx('filter-option', { 'is-active': filterValue === 'incomplete-tag' })} onClick={() => handleSelectFilter('incomplete-tag')}><T id="sidebar.overview.show-only-incomplete-tags" /></li>
                </ul>
              }
            </span>
          </div>
          <WebentitiesContainer 
            scrollTo={isLocating && `entity-card-${isLocating}`}
            onScrollSuccess={handleLocateSuccess} 
            isLoading={isLoading}>
            {isEmpty ?
              <li className="placeholder-empty">
                <T id="stack-status.no-webentities" values={{ list: selectedStack.toUpperCase() }} />
              </li>
              :
              stackWebentities[selectedStack] && stackWebentities[selectedStack].webentities &&
              stackWebentities[selectedStack].webentities
                .filter((webentity) => {
                  if (searchString.length) {
                    return JSON.stringify(webentity).toLowerCase().indexOf(searchString.toLowerCase()) > -1
                  }
                  return true
                })
                .map((entity, index) => {
                  const toggleAction = (obj, key, status) => {
                    return {
                      ...obj,
                      [key]: obj[key] === status ? null : status
                    }
                  }

                  const handleClickLink = () => onSelectWebentity(entity)

                  const handleClickOut = (e) => {
                    e.stopPropagation()
                    setStatusActions(toggleAction(statusActions, entity.id, 'OUT'))
                  }
                  const handleClickUndecided = (e) => {
                    e.stopPropagation()
                    setStatusActions(toggleAction(statusActions, entity.id, 'UNDECIDED'))
                  }
                  const isActive = tabWebentity && tabWebentity.status === selectedStack && tabWebentity.id === entity.id

                  return (
                    <EntityCard
                      key={index}
                      allowMerge={false}
                      link={entity}
                      isViewed={entity.viewed}
                      isActive={isActive}
                      onClickLink={handleClickLink}
                      onClickOut={handleClickOut}
                      onClickUndecided={handleClickUndecided}
                      isUndecidedActive={statusActions[entity.id] === 'UNDECIDED'}
                      isOutActive={statusActions[entity.id] === 'OUT'}
                    />
                  )
                })

            }
            {
              stackWebentities[selectedStack] &&
              stackWebentities[selectedStack].token &&
              stackWebentities[selectedStack].next_page &&
              <li className="entity-card pagination" onClick={handleLoadNextPage}>
                <T id="load-more-webentities" />
              </li>
            }
          </WebentitiesContainer>
          {
            isLoading &&
            <Spinner />
          }
          {
            pendingActions && pendingActions.length > 0
            &&
            <ul className="actions-container">
              <li onClick={resetActions} >
                <button className="btn cancel-btn">
                  <T id="discard-decisions" values={{ count: pendingActions.length }} />
                </button>
              </li>
              <li onClick={submitActions}>
                <button className="btn confirm-btn">
                  <T id="apply-decisions" values={{ count: pendingActions.length }} />
                </button>
              </li>
            </ul>
          }
          {
            !isEmpty &&
            <div className="webentities-list-footer">
              <DownloadListBtn onClickDownload={handleDownloadList} />
            </div>
          }
        </div>

      </div>
    </div>
  )
}

StackListLayout.contextTypes = {
  intl: intlShape
}

export default StackListLayout