import './StackListLayout.styl'

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { FormattedMessage as T, useIntl } from 'react-intl'

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
  stackWebentities,
  visitedWebentities,
  tabWebentity,
  searchString,
  searchedResult,
  isSearching,
  loadingStack,
  loadingBatchActions,
  onSelectStack,
  onBatchActions,
  onLoadNextPage,
  onDownloadList,
  onSelectWebentity,
  onUpdateSearch
}) => {
  const { formatMessage } = useIntl()

  const [isFilterOpen, setFilterOpen] = useState(false)
  const [filterValue, setFilterValue] = useState(null)
  const [selectedList, setSelectedListReal] = useState(selectedStack)
  const [isOpen, setOpen] = useState(false)

  const [isLocating, setIsLocating] = useState(undefined)

  const [numberOfEntities, setNumberOfEntities] = useState(counters[selectedStack])

  const isEmpty = counters[selectedList] === 0
  const isLoading = loadingBatchActions || loadingStack || isSearching

  // if filterValue is set, use local search instead of api search
  let filteredList = stackWebentities[selectedStack].webentities
    .filter((webentity) => {
      if (searchString.length) {
        return JSON.stringify(webentity).toLowerCase().indexOf(searchString.toLowerCase()) > -1
      }
      return true
    })
  if (!filterValue && searchString && searchString.length && searchedResult && searchedResult.webentities) {
    filteredList = searchedResult.webentities
  }


  useEffect(() => {
    setSelectedListReal(selectedStack)
    setNumberOfEntities(counters[selectedStack])
  }, [selectedStack])

  const [statusActions, setStatusActions] = useState({})

  const validateAction = (value, key) => {
    const findEntity = filteredList.find((e) => e.id.toString() === key)
    if (value && findEntity && findEntity.status !== value) return value
  }
  const pendingActions = Object.keys(pickBy(statusActions, validateAction))
    .map((key) => {
      return {
        id: +key,
        type: statusActions[key]
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
      setFilterValue(null)
      onSelectStack(l)
      setOpen(false)
      resetActions()
    }
  }

  const handleSelectFilter = (value) => {
    if (filterValue !== value) {
      onSelectStack(selectedStack, value)
      setFilterValue(value)
    }
    setFilterOpen(false)
  }

  const handleUpdateSearch = (e) => {
    onUpdateSearch(e.target.value, filterValue)
  }

  const handleDownloadList = () => onDownloadList(filteredList)

  const handleLocate = () => {
    if (tabWebentity.status !== selectedStack) {
      onSelectStack(tabWebentity.status)
    }
    setIsLocating(tabWebentity.id)
  }
  const handleLocateSuccess = () => {
    setIsLocating(undefined)
  }
  const handleRefresh = () => {
    onSelectStack(selectedStack)
    setNumberOfEntities(counters[selectedStack])
  }

  return (
    <div className="list-layout">
      <ul className="status-list-container">
        <EditionCartel
          isAlwaysOpen
          title={ formatMessage({ id: 'sidebar.overview.current-webentities-list' }) }
          help={ formatMessage({ id: 'sidebar.overview.current-webentities-list-help' }) }
        >
          <div className={ cx('status-list', { 'is-open': isOpen }) }>
            <ul className={ cx('webentities-list-of-lists') }>
              {
                USED_STACKS.map((stack, index) => {
                  const handleSelectList = () => {
                    setSelectedList(stack.id)
                  }
                  return (
                    <li key={ index } onClick={ handleSelectList } className={ 'list-name-container ' + (selectedList === stack.id ? 'is-active' : '') }>
                      <span className="list-btn-container">
                        <button className={ `list-btn ${stack.value}` }>
                          <span className="list-btn-text">
                            <T id={ `stack-status.${stack.id}` } />
                          </span>
                          <HelpPin className="list-btn-help">
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
            <button onClick={ () => setOpen(!isOpen) } className="status-list-toggle">
              <i className={ isOpen ? 'ti-angle-up' : 'ti-angle-down' } />
            </button>
          </div>
        </EditionCartel>

      </ul>
      <div className="webentities-list-wrapper">

        <div className="webentities-list-container">
          <div className={ cx('webentities-list-header', { 'is-disabled': isEmpty }) }>
            <input
              placeholder={ formatMessage({ id: 'sidebar.overview.search-a-webentity' }) }
              value={ searchString }
              onChange={ handleUpdateSearch }
            />
            <span className={ cx('filter-container', { 'is-active': isFilterOpen, 'has-filters': !!filterValue }) }>

              <button
                aria-label={ formatMessage({ id: 'filter' }) }
                onClick={ () => setFilterOpen(!isFilterOpen) }
                className="filter hint--bottom"
              >
                <i className="ti-filter" />
                { filterValue ?
                  filterValue==='no-tag' ?
                    <T id='sidebar.filter.no-tags' />: <T id='sidebar.filter.incomplete-tags' />
                  : <T id='sidebar.filter.all' />
                }
              </button>


              {isFilterOpen &&
                <ul className="filter-options">
                  <li className={ cx('filter-option', { 'is-active': !filterValue }) } onClick={ () => handleSelectFilter() }><T id="sidebar.overview.show-all-we" /></li>
                  <li className={ cx('filter-option', { 'is-active': filterValue === 'no-tag' }) } onClick={ () => handleSelectFilter('no-tag') }><T id="sidebar.overview.show-only-no-tags" /></li>
                  <li className={ cx('filter-option', { 'is-active': filterValue === 'incomplete-tag' }) } onClick={ () => handleSelectFilter('incomplete-tag') }><T id="sidebar.overview.show-only-incomplete-tags" /></li>
                </ul>
              }
            </span>
          </div>
          {
            tabWebentity &&
            <div className="locate-container">
              <button onClick={ handleLocate } className={ cx('btn locate hint--bottom', tabWebentity.status) } aria-label={ formatMessage({ id: 'locate-currently-browsed-webentity-help' }) }>
                <T id="locate-currently-browsed-webentity" />
              </button>
            </div>
          }
          {
            counters[selectedStack] !== numberOfEntities &&
            <div className="actualize-container">
              <button className="btn actualize" onClick={ handleRefresh }>
                {formatMessage({ id: 'actualize-entities-list' })}
                {` (${counters[selectedStack] > numberOfEntities ? `+${counters[selectedStack] - numberOfEntities}` : `-${numberOfEntities - counters[selectedStack]}`})`}
              </button>
            </div>
          }
          <WebentitiesContainer
            scrollTo={ isLocating && `entity-card-${isLocating}` }
            onScrollSuccess={ handleLocateSuccess }
            isLoading={ isLoading }
            isEmpty={ isEmpty }
            trigger={ stackWebentities[selectedStack] && stackWebentities[selectedStack].webentities }
          >
            {isEmpty ?
              <li className="placeholder-empty">
                <T id="stack-status.no-webentities" values={ { list: selectedStack.toUpperCase() } } />
              </li>
              : filteredList
                .map((entity, index) => {
                  const isViewed = visitedWebentities.find(id => id === entity.id.toString()) ? true: false
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
                      key={ index }
                      allowMerge={ false }
                      link={ entity }
                      isViewed={ isViewed }
                      isActive={ isActive }
                      onClickLink={ handleClickLink }
                      onClickOut={ handleClickOut }
                      onClickUndecided={ handleClickUndecided }
                      isUndecidedActive={ statusActions[entity.id] === 'UNDECIDED' }
                      isOutActive={ statusActions[entity.id] === 'OUT' }
                    />
                  )
                })

            }
            {
              (!searchString.length &&
              stackWebentities[selectedStack] &&
              stackWebentities[selectedStack].token &&
              stackWebentities[selectedStack].next_page) ||
              (searchString.length &&
              searchedResult &&
              searchedResult.token &&
              searchedResult.next_page) ?
                <li className="entity-card pagination" onClick={ onLoadNextPage }>
                  <T id="load-more-webentities" />
                </li> : null
            }
          </WebentitiesContainer>
          {
            isLoading &&
            <div className="loader-container">
              <Spinner />
            </div>
          }
          {
            pendingActions && pendingActions.length > 0
            &&
            <ul className="actions-container">
              <li onClick={ resetActions } >
                <button className="btn cancel-btn">
                  <T id="discard-decisions" />
                </button>
              </li>
              <li onClick={ submitActions }>
                <button className="btn confirm-btn">
                  <T id="apply-decisions" values={ { count: pendingActions.length } } />
                </button>
              </li>
            </ul>
          }
          {
            !isEmpty && (!pendingActions || pendingActions.length === 0) &&
            <div className="webentities-list-footer">
              <DownloadListBtn
                isDisabled={ filteredList.length === 0 }
                onClickDownload={ handleDownloadList }
              />
            </div>
          }
        </div>

      </div>
    </div>
  )
}

export default StackListLayout
