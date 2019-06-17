import React, { useState } from 'react'
import cx from 'classnames'

import EntityCard from '../EntityCard'
import DownloadListBtn from '../DownloadListBtn'
import EditionCartel from '../EditionCartel'
import HelpPin from '../../app/components/HelpPin'

const mockEntities = []
const names = ['Groupe Facebook sur les vaccins', 'Wikipedia | article about very long stuff', 'Ministère des affaires étrangères', 'Association contre les vaccins', 'Association pour les vaccins', 'Association pour la vaccination de Robert Hue']
const urls = ['http://facebook.com', 'https://fr.wikipedia.org/wiki/La_Maison_des_feuilles', 'https://www.diplomatie.gouv.fr/fr/dossiers-pays/ukraine/evenements/article/ukraine-declaration-conjointe-de-m-jean-yves-le-drian-ministre-de-l-europe-et']
for (let i = 0 ; i < 100 ; i++) {
  mockEntities.push({
    name: names[parseInt(Math.random() * names.length)],
    url: urls[parseInt(Math.random() * urls.length)],
    numberOfCitations: parseInt(Math.random() * 30, 10)
  })
}

const ListLayout = ({
  status = 'prospection',
  isLanding,
  isEmpty,
}) => {
  const [selectedList, setSelectedListReal] = useState(status)
  const [isOpen, setOpen] = useState(false)
  const [isFilterOpen, setFilterOpen] = useState(false)
    
  const [mergeActions, setMergeActions] = useState({})
  const [outActions, setOutActions] = useState({})
  const [undecidedActions, setUndecidedActions] = useState({})
  const resetActions = () => {
    setMergeActions({})
    setOutActions({})
    setUndecidedActions({})
  }
  const setSelectedList = l => {
    if (l === selectedList) {
      setOpen(!isOpen)
    } else {
      setSelectedListReal(l)
      setOpen(false)
    }
    resetActions()
  }
  const hasPendingActions = [mergeActions, outActions, undecidedActions].find(l => Object.keys(l).find(k => l[k])) !== undefined
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
              <li onClick={ () => setSelectedList('prospection') } className={ 'list-name-container ' + (selectedList === 'prospection' ? 'is-active': '') }>
                <span className="list-btn-container">
                  <button className="list-btn prospection">
                            Webentities in prospection<HelpPin>webentities discovered through browsing or by analyzing webentities that you included in the corpus</HelpPin>
                  </button>
                </span>
                <span className="count">
                  {isEmpty ? 0 : 12000}
                </span>
              </li>
                    
              <li onClick={ () => setSelectedList('in') } className={ 'list-name-container ' + (selectedList === 'in' ? 'is-active': '') }>
                <span className="list-btn-container">
                  <button className="list-btn in">
                            Webentities in the corpus<HelpPin>webentities relevant to the inquiry, that you included in the corpus</HelpPin>
                  </button>
                </span>
                <span className="count">
                  {isEmpty ? 0 : 12000}
                </span>
              </li>
              <li onClick={ () => setSelectedList('out') } className={ 'list-name-container ' + (selectedList === 'out' ? 'is-active': '') }>
                <span className="list-btn-container">
                  <button className="list-btn out">
                            Webentities OUT of the corpus<HelpPin>webentities irrelevant to the inquiry, that you excluded from the corpus</HelpPin>
                  </button>
                </span>
                <span className="count">
                  {isEmpty ? 0 : 12000}
                </span>
              </li>
              <li onClick={ () => setSelectedList('undecided') } className={ 'list-name-container ' + (selectedList === 'undecided' ? 'is-active': '') }>
                <span className="list-btn-container">
                  <button className="list-btn undecided">
                            Webentities undecided<HelpPin>webentities that you have put aside for further decision to put them in or out of the corpus</HelpPin>
                  </button>
                </span>
                <span className="count">
                  {isEmpty ? 0 : 12000}
                </span>
              </li>
            </ul>
            <button onClick={ () => setOpen(!isOpen) } className="status-list-toggle">
              <i className={ isOpen ? 'ti-arrow-circle-up' : 'ti-arrow-circle-down' } />
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
          <ul className="webentities-list">
            {isEmpty ? 
              <li className="placeholder-empty">{'No webentities yet in the ' + selectedList.toUpperCase() + ' list'}</li>
              :
              mockEntities.map((entity, index)=> {
  
                const toggleKey = (obj, key) => {
                  return {
                    ...obj,
                    ['' + key]: obj['' + key] ? false : true
                  }
                }
      
                const handleClickMerge = () => setMergeActions(toggleKey(mergeActions, index))
                const handleClickOut = () => setOutActions(toggleKey(outActions, index))
                const handleClickUndecided = () => setUndecidedActions(toggleKey(undecidedActions, index))
                
                return (
                  <EntityCard 
                    key={ index }
                    { ...entity } 
                    status={ selectedList } 
                    displayStatus={ false } 
                    isActive={ !isLanding && index === 1 } 
                    onClickMerge={ handleClickMerge }
                    onClickOut={ handleClickOut }
                    onClickUndecided={ handleClickUndecided }
                    isMergeActive={ mergeActions[index] }
                    isUndecidedActive={ undecidedActions[index] }
                    isOutActive={ outActions[index] }
                  />
                )
              })
            }
          </ul>
        </div>
        {
          hasPendingActions
            &&
            <ul onClick={ resetActions } className="actions-container">
              <li><button className="btn cancel-btn">Discard 12 decisions</button></li>
              <li><button className="btn confirm-btn">Apply 12 decisions on webentities</button></li>
            </ul>
        }
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

export default ListLayout