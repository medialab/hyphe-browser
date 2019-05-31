import './BrowserLayout.styl'

import React, { useState } from 'react'
import cx from 'classnames'

import BrowserBar from '../BrowserBarMock'
import EditionCartel from '../EditionCartel'
import { ResearchNotesOnly } from '../ResearchNotesMock'
import { Tags } from '../TagsMock'
import { KnownPages } from '../CitedPagesMock'
import { LinkedWebentities } from '../LinkedEntitiesMock'
import EntityCard from '../EntityCard'
import EntityModal from '../EntityModalMock'
import DownloadListBtn from '../DownloadListBtn'

import HelpPin from '../../app/components/HelpPin'

const BrowserHeader = () => {
  return (
    <div className="browser-header">
      <div className="header-group header-group-main">
        <h1>Mon corpus <i aria-label="server is ok" className="server-status hint--right" /></h1>
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

const BrowserTabs = () => {
  return (
    <div className="browser-tabs">
      <div className="browser-tab-label active" title="Tests, comparatifs et fiches techniques | 01net.com">
        <object data="https://static.bfmtv.com/ressources/favicon/site01net/favicon.ico" width="16" height="16" className="browser-tab-favicon" />
        <span className="browser-tab-title">01Net.com</span>
      </div>
      <div className="browser-tab-new" title="Open new tab" />
    </div>
  )
}

const mockEntities = []
for (let i = 0 ; i < 100 ; i++) {
  mockEntities.push({
    type: 'prospection',
    name: 'facebook',
    url: 'http://facebook.com',
    numberOfCitations: parseInt(Math.random() * 30, 10)
  })
}

const ListLayout = function ({
  status = 'prospection'
}) {
  const [selectedList, setSelectedListReal] = useState(status)
  const [isOpen, setOpen] = useState(false)
  const [isFilterOpen, setFilterOpen] = useState(false)
  const setSelectedList = l => {
    if (l === selectedList) {
      setOpen(!isOpen)
    } else {
      setSelectedListReal(l)
      setOpen(false)
    }
    
  }
  return (
    <div className="list-layout">
      <div className="status-list-container">
      <div className={cx('status-list', {'is-open': isOpen})}>
        <h3 className="list-of-lists-title">
          Current list
        </h3>
        <ul className={cx('webentities-list-of-lists')}>
          <li onClick={ () => setSelectedList('prospection') } className={ selectedList === 'prospection' ? 'is-active': '' }>
            <span className="list-btn-container">
              <button className="list-btn">
                        Webentities in prospection
              </button>
            </span>
            <span className="count">
                        12000
            </span>
          </li>
                
          <li onClick={ () => setSelectedList('in') } className={ selectedList === 'in' ? 'is-active': '' }>
            <span className="list-btn-container">
              <button className="list-btn">
                        Webentities in the corpus
              </button>
            </span>
            <span className="count">
                        12000
            </span>
          </li>
          <li onClick={ () => setSelectedList('out') } className={ selectedList === 'out' ? 'is-active': '' }>
            <span className="list-btn-container">
              <button className="list-btn">
                        Webentities OUT of the corpus
              </button>
            </span>
            <span className="count">
                        12000
            </span>
          </li>
          <li onClick={ () => setSelectedList('undecided') } className={ selectedList === 'undecided' ? 'is-active': '' }>
            <span className="list-btn-container">
              <button className="list-btn">
                        Webentities undecided (put aside)
              </button>
            </span>
            <span className="count">
                        12000
            </span>
          </li>
        </ul>
        <button onClick={() => setOpen(!isOpen)} className="status-list-toggle">
          <i className={isOpen ? 'ti-arrow-circle-up' : 'ti-arrow-circle-down'} />
        </button>
      </div>
      </div>
      <div className="webentities-list-wrapper">
        <div className="webentities-list-header">
          <input placeholder="search a webentity in the prospections list" />
          <span className={cx('filter-container', {'is-active': isFilterOpen})}>
            <button onClick={() => setFilterOpen(!isFilterOpen)} className="filter">
                  filter <i className="ti-angle-down" />
            </button>
            {/*isFilterOpen &&
            <span className="filter-options-bg" onClick={() => setFilterOpen(false)}></span>
            */}
            {isFilterOpen && 
            <ul className="filter-options">
              <li>Show only WE with no tags</li>
              <li>Show only WE with incomplete tags</li>
            </ul>
            }
          </span>
        </div>
        <div className="webentities-list-container">
        <ul className="webentities-list">
          {
            mockEntities.map((entity, index)=> (
              <EntityCard { ...entity } isActive={index === 1} />
            ))
          }
        </ul>
        </div>
        <div className="webentities-list-footer">
          <DownloadListBtn />
          
        </div>
      </div>
    </div>
  )
}

const BrowseLayout = function ({
  status = 'prospection'
}) {
  const [knownPagesOpen, setKnownPagesOpen] = useState(false)
  const [linkedEntitiesOpen, setLinkedEntitiesOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [nameOpen, setNameOpen] = useState(true)
  const [statusOpen, setStatusOpen] = useState(true)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  console.log('status', status);
  return (
    <div className="browse-layout">
      <nav className="browse-nav">
        <button className="hint--right" aria-label="browse previous entity in the prospections list"><i className="ti-angle-left" /></button>
        <span className="current-webentity-name">101 net</span>
        <button className="hint--left" aria-label="browse next entity in the prospections list"><i className="ti-angle-right" /></button>
      </nav>
      <div className="browse-edition-container">
        

        <EditionCartel
          isOpen={ statusOpen }
          onToggle={ () => setStatusOpen(!statusOpen) }
          title={ 'Webentity status' }
          help={ 'Decide whether the currently browsed webentity should be included in your corpus, excluded, or put aside as "undecided" for further inquiry' }
          helpDirection={'right'}
          isAlwaysOpen={status === 'prospection'}
        >
          <ul className="set-status-container">
            <li className={status === 'in' ? 'in' : ''} onClick={ () => setModalIsOpen(true) }>In<HelpPin>include this webentity in the corpus and move it to the IN list</HelpPin></li>
            <li className={status === 'undecided' ? 'undecided' : ''}>Und.<HelpPin place="bottom">move this webentity to the UNDECIDED list</HelpPin></li>
            <li className={status === 'out' ? 'out' : ''}>Out<HelpPin place="left">exclude this webentity and move it to the OUT list</HelpPin></li>
          </ul>
        </EditionCartel>

        <EditionCartel
          isOpen={ nameOpen }
          onToggle={ () => setNameOpen(!nameOpen) }
          title={ 'Webentity name' }
          help={ 'This is the name of the current webentity. It will be displayed in the lists and visualizations' }
          isAlwaysOpen={status === 'prospection'}
        >
          <input className="input" value="101net" />
        </EditionCartel>
        <EditionCartel
          isOpen={ knownPagesOpen }
          onToggle={ () => setKnownPagesOpen(!knownPagesOpen) }
          title={ 'Known webpages' }
          help={ 'Pages belonging to the currently browsed webentity' }
        >
          <KnownPages activeIndex={0} homepageIndex={1} />
        </EditionCartel>
        <EditionCartel
          isOpen={ linkedEntitiesOpen }
          onToggle={ () => setLinkedEntitiesOpen(!linkedEntitiesOpen) }
          title={ 'Linked webentities' }
          help={ 'Webentities citing or cited by the currently browsed webentity' }
        >
          <LinkedWebentities />
        </EditionCartel>
        <EditionCartel
          isOpen={ tagsOpen }
          onToggle={ () => setTagsOpen(!tagsOpen) }
          title={ 'Tags' }
          help={ 'Categorized tags about the currently browsed webentity' }
        >
          <Tags />
        </EditionCartel>
        <EditionCartel
          isOpen={ notesOpen }
          onToggle={ () => setNotesOpen(!notesOpen) }
          title={ 'Field notes' }
          help={ 'Free notes about the currently browsed webentity' }
          helpDirection="top"
        >
          <ResearchNotesOnly />
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
  status
}) {
  const [asideMode, setAsideMode] = useState('browse')
    
  return (
    <aside className="browser-column browser-aside-column">
      <ul className="aside-header switch-mode-container">
        <li><button onClick={ () => setAsideMode('list') } className={ cx('mode-btn', { 'is-active': asideMode === 'list' }) }>
            <span>Edit lists of webentities <HelpPin>review and curate the webentities of your corpus</HelpPin></span></button>
        </li>
        <li><button onClick={ () => setAsideMode('browse') } className={ cx('mode-btn', { 'is-active': asideMode === 'browse' }) }>
            <span>Edit current webentity <HelpPin>edit information about the currently browsed webentity</HelpPin></span></button>
        </li>
      </ul>
      <div className="aside-content">
        {
          asideMode === 'list' ?
            <ListLayout status={status} />
            :
            <BrowseLayout status={status} />
        }
      </div>
    </aside>
  )
}

const BrowserLayout = ({
  status
}) => {
  return (
    <div className="browser-layout">
      <BrowserHeader />
      <div className="browser-main-container">
        <AsideLayout {...{status}} />
        <section className="browser-column browser-main-column">
          <BrowserTabs />
          <BrowserBar displayAddButton={status === 'in'} />
          <iframe className="webview" src="https://www.01net.com/tests/" />
        </section>
      </div>
    </div>
  )
}

export default BrowserLayout