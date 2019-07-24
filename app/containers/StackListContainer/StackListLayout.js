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
  onSelectWebentity
}, { intl }) => {
  const { formatMessage } = intl

  const [isFilterOpen, setFilterOpen] = useState(false)
  const [filterValue, setFilterValue] = useState(stackFilter)
  const [selectedList, setSelectedListReal] = useState(selectedStack)
  const [isOpen, setOpen] = useState(false)
  const [searchString, setSearchString] = useState('')

  useEffect(() => {
    setSelectedListReal(selectedStack)
  }, [selectedStack])

  useEffect(() => {
    setFilterValue(stackFilter)
  }, [stackFilter])

  const [statusActions, setStatusActions] = useState({})

  const pendingActions = Object.keys(pickBy(statusActions, v => v)).map((key) =>  {
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
      onSelectStack(l)
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

  const isEmpty = counters[selectedList] === 0
  const stackInfo = USED_STACKS.find((stack) => stack.id === selectedStack)
  return (
    <div className="list-layout">
      <div className="status-list-container">
        <EditionCartel
          isAlwaysOpen
          title="Current webentities list"
          help="Choose which types of webentities you want to review"
        >
          <div className={ cx('status-list', { 'is-open': isOpen }) }>
            <ul className={ cx('webentities-list-of-lists') }>
              {
                USED_STACKS.map((stack, index) => {
                  const handleSelectList = () => {
                    setSelectedList(stack.id)
                  }
                  return (
                    <li key={ index } onClick={ handleSelectList } className={ 'list-name-container ' + (selectedList === stack.id ? 'is-active': '') }>
                      <span className="list-btn-container">
                        <button className={ `list-btn ${stack.value}` }>
                          <T id={ `stack-status.${stack.id}` } />
                          <HelpPin>
                            { formatMessage({ id: `stack-status.help.${stack.id}` }) }
                          </HelpPin>
                        </button>
                      </span>
                      <span className="count">
                        {stackWebentities[stack.id] && stackWebentities[stack.id].total_results}
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
          
      </div>
      <div className="webentities-list-wrapper">
        <div className={ cx('webentities-list-header', { 'is-disabled': isEmpty }) }>
          <input 
            placeholder={ `search a webentity in the ${stackInfo.value} list` }
            value={ searchString }
            onChange={ handleSearch } />
          <span className={ cx('filter-container', { 'is-active': isFilterOpen }) }>
            <button onClick={ () => setFilterOpen(!isFilterOpen) } className="filter">
                    filter <i className="ti-angle-down" />
            </button>
            {isFilterOpen && 
              <ul className="filter-options">
                <li className={ cx('filter-option', { 'is-active': filterValue === 'no-tag' }) } onClick={ () => handleSelectFilter('no-tag') }>Show only webentities with no tags</li>
                <li className={ cx('filter-option', { 'is-active': filterValue === 'incomplete-tag' }) } onClick={ () => handleSelectFilter('incomplete-tag') }>Show only webentities with incomplete tags</li>
              </ul>
            }
          </span>
        </div>
        <div className="webentities-list-container">
          <ul className={ cx('webentities-list', { 'is-loading': loadingBatchActions || loadingStack }) }>
            {isEmpty ? 
              <li className="placeholder-empty">{'No webentities yet in the ' + selectedStack.toUpperCase() + ' list'}</li>
              :
              stackWebentities[selectedStack] && stackWebentities[selectedStack].webentities &&
              stackWebentities[selectedStack].webentities
                .filter((webentity) => {
                  if (searchString.length) {	
                    return JSON.stringify(webentity).toLowerCase().indexOf(searchString.toLowerCase()) > -1
                  }	
                  return true
                })
                .map((entity, index)=> {

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
              stackWebentities[selectedStack] && 
              stackWebentities[selectedStack].token &&
              stackWebentities[selectedStack].next_page && 
              <li className="entity-card pagination" onClick={ handleLoadNextPage }>load more...</li>
            }
          </ul>
          {
            pendingActions && pendingActions.length > 0
            &&
            <ul className="actions-container">
              <li onClick={ resetActions } ><button className="btn cancel-btn">Discard decisions</button></li>
              <li onClick={ submitActions }><button className="btn confirm-btn">Apply {pendingActions.length} decisions</button></li>
            </ul>
          }
        </div>
        {
          !isEmpty &&
            <div className="webentities-list-footer">
              <DownloadListBtn />
            </div>
        }
      </div>
    </div>
  )
}

StackListLayout.contextTypes = {
  intl: intlShape
}

export default StackListLayout