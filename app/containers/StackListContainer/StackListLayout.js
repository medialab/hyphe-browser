import './StackListLayout.styl'

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { pickBy } from 'lodash'

import EntityCard from '../../components/EntityCard'
import DownloadListBtn from '../../components/DownloadListBtn'
import EditionCartel from '../../components/EditionCartel'
import HelpPin from '../../components/HelpPin'
import { USED_STACKS } from '../../constants'

const StackListLayout = ({
  isLanding,
  isEmpty,
  counters,
  selectedStack,
  stackWebentities,
  tabUrl,
  loadingBatchActions,
  onSelectStack,
  onBatchActions,
  onOpenTab

}) => {
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [selectedList, setSelectedListReal] = useState(selectedStack)
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    setSelectedListReal(selectedStack)
  }, [selectedStack])

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
                            Webentities in {stack.value}<HelpPin>webentities discovered through browsing or by analyzing webentities that you included in the corpus</HelpPin>
                        </button>
                      </span>
                      <span className="count">
                        {isEmpty ? 0 : counters[stack.id]}
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
          <input placeholder="search a webentity in the prospections list" />
          <span className={ cx('filter-container', { 'is-active': isFilterOpen }) }>
            <button onClick={ () => setFilterOpen(!isFilterOpen) } className="filter">
                    filter <i className="ti-angle-down" />
            </button>
            {isFilterOpen && 
              <ul onClick={ () => setFilterOpen(false) } className="filter-options">
                <li>Show only webentities with no tags</li>
                <li>Show only webentities with incomplete tags</li>
                <li>Show only new webentities</li>
              </ul>
            }
          </span>
        </div>
        <div className="webentities-list-container">
          <ul className={ cx('webentities-list', { 'is-loading': loadingBatchActions }) }>
            {isEmpty ? 
              <li className="placeholder-empty">{'No webentities yet in the ' + selectedStack.toUpperCase() + ' list'}</li>
              :
              stackWebentities.map((entity, index)=> {

                const toggleAction = (obj, key, status) => {
                  return {
                    ...obj,
                    [key]: obj[key] === status ? null : status
                  }
                }

                const handleClickLink = (e) => {
                  e.stopPropagation()
                  onOpenTab(entity.homepage)
                }
 
                const handleClickOut = (e) => {
                  e.stopPropagation()
                  setStatusActions(toggleAction(statusActions, entity.id, 'OUT'))
                }
                const handleClickUndecided = (e) => {
                  e.stopPropagation()
                  setStatusActions(toggleAction(statusActions, entity.id, 'UNDECIDED'))
                }
    
                return (
                  <EntityCard 
                    key={ index }
                    allowMerge={ false }
                    link={ entity }
                    isActive={ !isLanding && tabUrl === entity.homepage } 
                    onClickLink={ handleClickLink } 
                    onClickOut={ handleClickOut }
                    onClickUndecided={ handleClickUndecided }
                    isUndecidedActive={ statusActions[entity.id] === 'UNDECIDED' }
                    isOutActive={ statusActions[entity.id] === 'OUT' }
                  />
                )
              })
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

export default StackListLayout