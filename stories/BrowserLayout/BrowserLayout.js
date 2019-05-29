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

import HelpPin from '../../app/components/HelpPin'

const BrowserHeader = () => {
  return (
    <div className="browser-header">
      <div className="header-group header-group-main">
        <h1>Mon corpus <i aria-label="server is ok" className="server-status hint--right" /></h1>
      </div>
      <div className="header-group header-group-aside">
        <ul className="header-buttons">
          <li><button className="btn is-active">review</button></li>
          <li><button className="btn">analyze</button></li>
          <li><button className="btn"><i className="ti-close" /></button></li>
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

const ListLayout = function () {
  const [selectedList, setSelectedList] = useState('prospections')
  return (
    <div className="list-layout">
      <div className="status-list">
        <ul className="webentities-list-of-lists">
          <li onClick={ () => setSelectedList('prospections') } className={ selectedList === 'prospections' ? 'is-active': '' }>
            <span className="list-btn-container">
              <button className="list-btn">
                        Prospections <HelpPin>help</HelpPin>
              </button>
            </span>
            <span className="count">
                        12
            </span>
          </li>
                
          <li onClick={ () => setSelectedList('in') } className={ selectedList === 'in' ? 'is-active': '' }>
            <span className="list-btn-container">
              <button className="list-btn">
                        Entities in <HelpPin>help</HelpPin>
              </button>
            </span>
            <span className="count">
                        12
            </span>
          </li>
          <li onClick={ () => setSelectedList('out') } className={ selectedList === 'out' ? 'is-active': '' }>
            <span className="list-btn-container">
              <button className="list-btn">
                        Entities out <HelpPin>help</HelpPin>
              </button>
            </span>
            <span className="count">
                        12
            </span>
          </li>
          <li onClick={ () => setSelectedList('undecided') } className={ selectedList === 'undecided' ? 'is-active': '' }>
            <span className="list-btn-container">
              <button className="list-btn">
                        Entities undecided <HelpPin>help</HelpPin>
              </button>
            </span>
            <span className="count">
                        12
            </span>
          </li>
        </ul>
      </div>
      <div className="webentities-list-wrapper">
        <div className="webentities-list-header">
          <input placeholder="search a webentity" />
          <span className="filter">
                filter <i className="ti-angle-down" />
          </span>
        </div>
        <ul className="webentities-list">
          {
            mockEntities.map((entity)=> (
              <EntityCard { ...entity } />
            ))
          }
        </ul>
        <div className="webentities-list-footer">
               Download list (csv)
          <span>&nbsp;</span>
          <span className="ti-download" />
        </div>
      </div>
    </div>
  )
}

const BrowseLayout = function () {
  const [knownPagesOpen, setKnownPagesOpen] = useState(false)
  const [linkedEntitiesOpen, setLinkedEntitiesOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  return (
    <div className="browse-layout">
      <nav className="browse-nav">
        <button className="hint--right" aria-label="browse previous entity"><i className="ti-angle-left" /></button>
        <span className="current-webentity-name">101 net</span>
        <button className="hint--left" aria-label="browse next entity"><i className="ti-angle-right" /></button>
      </nav>
      <div className="browse-edition-container">
        

        <EditionCartel
          isOpen
          title={ 'Webentity status' }
          help={ 'Help about entity status' }
          isAlwaysOpen
        >
          <ul className="set-status-container">
            <li onClick={ () => setModalIsOpen(true) }>In<HelpPin>put webentity to the IN list</HelpPin></li>
            <li>U<HelpPin place="bottom">put webentity to the UNDECIDED list</HelpPin></li>
            <li>Out<HelpPin place="left">put webentity to the OUT list</HelpPin></li>
          </ul>
        </EditionCartel>

        <EditionCartel
          isOpen
          title={ 'Webentity name' }
          help={ 'Help about entity name' }
          isAlwaysOpen
        >
          <input value="101net" />
        </EditionCartel>
        <EditionCartel
          isOpen={ knownPagesOpen }
          onToggle={ () => setKnownPagesOpen(!knownPagesOpen) }
          title={ 'Known pages' }
          help={ 'Help about known pages' }
        >
          <KnownPages />
        </EditionCartel>
        <EditionCartel
          isOpen={ linkedEntitiesOpen }
          onToggle={ () => setLinkedEntitiesOpen(!linkedEntitiesOpen) }
          title={ 'Linked webentities' }
          help={ 'Help about linked webentities' }
        >
          <LinkedWebentities />
        </EditionCartel>
        <EditionCartel
          isOpen={ tagsOpen }
          onToggle={ () => setTagsOpen(!tagsOpen) }
          title={ 'Tags' }
          help={ 'Help about tags' }
        >
          <Tags />
        </EditionCartel>
        <EditionCartel
          isOpen={ notesOpen }
          onToggle={ () => setNotesOpen(!notesOpen) }
          title={ 'Notes' }
          help={ 'Help about notes' }
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

const AsideLayout = function () {
  const [asideMode, setAsideMode] = useState('browse')
    
  return (
    <aside className="browser-column browser-aside-column">
      <ul className="aside-header switch-mode-container">
        <li><button onClick={ () => setAsideMode('list') } className={ cx('mode-btn', { 'is-active': asideMode === 'list' }) }>
            <span>Webentities list <HelpPin>help</HelpPin></span></button>
        </li>
        <li><button onClick={ () => setAsideMode('browse') } className={ cx('mode-btn', { 'is-active': asideMode === 'browse' }) }>
            <span>Browsed webentity <HelpPin>help</HelpPin></span></button>
        </li>
      </ul>
      <div className="aside-content">
        {
          asideMode === 'list' ?
            <ListLayout />
            :
            <BrowseLayout />
        }
      </div>
    </aside>
  )
}

const BrowserLayout = () => {
  return (
    <div className="browser-layout">
      <BrowserHeader />
      <div className="browser-main-container">
        <AsideLayout />
        <section className="browser-column browser-main-column">
          <BrowserTabs />
          <BrowserBar />
          <iframe className="webview" src="https://www.01net.com/tests/" />
        </section>
      </div>
    </div>
  )
}

export default BrowserLayout