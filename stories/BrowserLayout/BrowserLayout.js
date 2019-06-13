import './BrowserLayout.styl'

import React, { useState } from 'react'
import cx from 'classnames'

import BrowserBar from '../BrowserBarMock'
import EditionCartel from '../EditionCartel'
import { FieldNotesOnly } from '../FieldNotesMock'
import { Tags } from '../TagsMock'
import { KnownPages } from '../KnownPagesMock'
import { LinkedWebentities } from '../LinkedEntitiesMock'
import EntityCard from '../EntityCard'
import EntityModal from '../EntityModalMock'
import DownloadListBtn from '../DownloadListBtn'
import NewTabContent from '../NewTabContent'

import HelpPin from '../../app/components/HelpPin'

const BrowserHeader = () => {
  return (
    <div className="browser-header">
      <div className="header-group header-group-main">
        <h1>My inquiry <i aria-label="server is ok" className="server-status hint--right" /></h1>
        <ul className="header-metrics-container">
          <li className="hint--bottom" aria-label="12 webentities in prospection"><i className="metrics-icon ti-layout-column3-alt prospection"/> <span className="metrics">12k <label>prospects.</label></span></li>
          <li className="hint--bottom" aria-label="12 webentities included in the corpus"><i className="metrics-icon ti-layout-column3-alt in"/> <span className="metrics">12009 <label>IN</label></span></li>
          <li className="hint--bottom" aria-label="12 webentities excluded from the corpus"><i className="metrics-icon ti-layout-column3-alt out"/> <span className="metrics">3092 <label>OUT</label></span></li>
          <li className="hint--bottom" aria-label="12 webentities undecided"><i className="metrics-icon ti-layout-column3-alt undecided"/> <span className="metrics">12 <label>UND.</label></span></li>
        </ul>
      </div>
      <div className="header-group header-group-aside">
        <ul className="header-buttons">
          <li><button className="btn is-active">browse & review</button></li>
          <li><button className="btn">visualize in hyphe</button></li>
          <li><button aria-label="close corpus" className="btn hint--left"><i className="ti-close" /></button></li>
        </ul>
      </div>
    
    </div>
  )
}

const BrowserTabs = ({
  isEmpty
}) => {
  return (
    <div className="browser-tabs">
      <div className="browser-tab-label active" title="La maison des feuilles | Wikipedia">
        {!isEmpty && <object data="https://wikipedia.org/static/favicon/wikipedia.ico" width="16" height="16" className="browser-tab-favicon" />}
        <span className="browser-tab-title">{isEmpty ? 'New tab' : 'La Maison des Feuilles - Wikipedia'}</span>
      </div>
      <div className="browser-tab-new" title="Open new tab" />
    </div>
  )
}

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

const ListLayout = function ({
  status = 'prospection',
  isLanding,
  isEmpty,
}) {
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
        <div className={cx("webentities-list-header", {'is-disabled': isEmpty})}>
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
        {!isEmpty &&
        <div className="webentities-list-footer">
          <DownloadListBtn />
        </div>
        }
      </div>
    </div>
  )
}

const BrowseLayout = function ({
  status = 'prospection',
}) {
  const [knownPagesOpen, setKnownPagesOpen] = useState(false)
  const [linkedEntitiesOpen, setLinkedEntitiesOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [nameOpen, setNameOpen] = useState(true)
  const [statusOpen, setStatusOpen] = useState(true)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  return (
    <div className="browse-layout">
      <nav className="browse-nav">
        <button className="hint--right" aria-label="browse previous entity in the prospections list"><i className="ti-angle-left" /></button>
        <span className="current-webentity-name">La maison des feuilles</span>
        <button className="hint--left" aria-label="browse next entity in the prospections list"><i className="ti-angle-right" /></button>
      </nav>
      <div className="browse-edition-container">
        

        <EditionCartel
          isOpen={ statusOpen }
          onToggle={ () => setStatusOpen(!statusOpen) }
          title={ 'Webentity status' }
          help={ 'Decide whether the currently browsed webentity should be included in your corpus, excluded, or put aside as "undecided" for further inquiry' }
          helpPlace={ 'right' }
          isAlwaysOpen={ status === 'prospection' }
        >
          <ul className="set-status-container">
            <li className={ status === 'in' ? 'in' : '' } onClick={ () => setModalIsOpen(true) }>IN<HelpPin>include this webentity in the corpus and move it to the IN list</HelpPin></li>
            <li className={ status === 'undecided' ? 'undecided' : '' }>UND.<HelpPin place="bottom">move this webentity to the UNDECIDED list</HelpPin></li>
            <li className={ status === 'out' ? 'out' : '' }>OUT<HelpPin place="left">exclude this webentity and move it to the OUT list</HelpPin></li>
          </ul>
        </EditionCartel>

        <EditionCartel
          isOpen={ nameOpen }
          onToggle={ () => setNameOpen(!nameOpen) }
          title={ 'Webentity name' }
          help={ 'Edit the name of the currently browsed webentity. It will be displayed in lists and visualizations' }
          isAlwaysOpen={ status === 'prospection' }
        >
          <input className="input" value="La maison des feuilles" />
        </EditionCartel>
        <EditionCartel
          isOpen={ knownPagesOpen }
          onToggle={ () => setKnownPagesOpen(!knownPagesOpen) }
          title={ 'Known webpages' }
          help={ 'Review known pages belonging to the currently browsed webentity' }
        >
          <KnownPages activeIndex={ 0 } homepageIndex={ 1 } />
        </EditionCartel>
        <EditionCartel
          isOpen={ linkedEntitiesOpen }
          onToggle={ () => setLinkedEntitiesOpen(!linkedEntitiesOpen) }
          title={ 'Linked webentities' }
          help={ 'Review webentities citing or cited by the currently browsed webentity' }
        >
          <LinkedWebentities />
        </EditionCartel>
        <EditionCartel
          isOpen={ tagsOpen }
          onToggle={ () => setTagsOpen(!tagsOpen) }
          title={ 'Tags' }
          helpPlace={ 'right' }
          help={ 'Annotate the currently browsed webentity with categorized tags (this will be useful to group and visualize webentities)' }
        >
          <Tags />
        </EditionCartel>
        <EditionCartel
          isOpen={ notesOpen }
          onToggle={ () => setNotesOpen(!notesOpen) }
          title={ 'Field notes' }
          help={ 'Write free comments and remarks about the currently browsed webentity' }
          helpPlace="top"
        >
          <FieldNotesOnly />
        </EditionCartel>
        <EntityModal
          isOpen={ modalIsOpen }
          onToggle={ () => setModalIsOpen(false) }
        />
      </div>    
    </div>
  )
}

const AsideLayout = function ({
  status,
  isLanding,
  isEmpty,
}) {
  const [asideMode, setAsideMode] = useState(isLanding ? 'list' : 'browse')
    
  return (
    <aside className="browser-column browser-aside-column">
      <ul className="aside-header switch-mode-container">
        <li><button onClick={ () => setAsideMode('list') } className={ cx('mode-btn', { 'is-active': asideMode === 'list' }) }>
          <span>Inquiry overview <HelpPin>review and curate the webentities constituting your inquiry</HelpPin></span></button>
        </li>
        <li><button disabled={ isLanding } onClick={ () => setAsideMode('browse') } className={ cx('mode-btn', { 'is-active': asideMode === 'browse' }) }>
          <span>Browsed webentity <HelpPin>edit information about the currently browsed webentity</HelpPin></span></button>
        </li>
      </ul>
      <div className="aside-content">
        {
          asideMode === 'list' ?
            <ListLayout isLanding={isLanding} isEmpty={isEmpty} status={ status } />
            :
            <BrowseLayout status={ status } />
        }
      </div>
    </aside>
  )
}

const BrowserLayout = ({
  status,
  isEmpty,
  isLanding
}) => {
  return (
    <div className="browser-layout">
      <BrowserHeader />
      <div className="browser-main-container">
        <AsideLayout { ...{ status, isLanding, isEmpty } } />
        <section className="browser-column browser-main-column">
          <BrowserTabs isEmpty={ isEmpty } />
          <BrowserBar isLanding={ isLanding } displayAddButton={ status === 'in' } />
          {
            isLanding ?
              <NewTabContent isEmpty={ isEmpty } />
              :
              <iframe className="webview" src="https://fr.wikipedia.org/wiki/La_Maison_des_feuilles" />
          }
        </section>
      </div>
    </div>
  )
}

export default BrowserLayout