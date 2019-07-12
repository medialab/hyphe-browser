
import React, { useState } from 'react'
import { FormattedMessage as T, intlShape } from 'react-intl'
import { pickBy, values } from 'lodash'

import { TAGS_NS } from '../../constants'

import EditionCartel from '../../components/EditionCartel'
import FieldNotes from '../../components/FieldNotes'
import LinkedWebentities from '../../components/LinkedWebentities'
import KnownPages from '../../components/KnownPages'
import Tags from '../../components/Tags'
// import EntityModal from '../../components/EntityModalMock'

import HelpPin from '../../components/HelpPin'
import WebentityNameField from './WebentityNameField'

const WebentityBrowseLayout = ({
  webentity,
  tabUrl,
  categories,
  tagsSuggestions,
  onDownloadList,
  onSetWebentityStatus,
  onSetTabUrl,
  onOpenTab,
  onBatchActions,
  onSetWebentityName,
  onSetWebentityHomepage,
  onAddTag,
  onRemoveTag
}, { intl }) => {
  const { formatMessage } = intl

  const [knownPagesOpen, setKnownPagesOpen] = useState(false)
  const [linkedEntitiesOpen, setLinkedEntitiesOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [nameOpen, setNameOpen] = useState(true)
  const [statusOpen, setStatusOpen] = useState(true)
  const [modalIsOpen, setModalIsOpen] = useState(false)

  /**
   * Linked entities related
   */
  const [selectedLinkedEntities, setSelectedLinkedEntities] = useState('referrers')
  const [mergeLinkedEntitiesActions, setMergeLinkedEntitiesActions] = useState({})
  const [statusActions, setStatusActions] = useState({})
  
  const resetLinkedEntitiesActions = () => {
    setMergeLinkedEntitiesActions({})
    setStatusActions({})
  }
  
  const pendingActions = {
    'mergeActions': Object.keys(pickBy(mergeLinkedEntitiesActions, v => v)).map((id) => {
      return {
        [id]: 'merge'
      }
    }),
    'statusActions':Object.keys(pickBy(statusActions, v => v)).map((id) => {
      return {
        [id]: statusActions[id]
      }
    })
  }

  const pendingLinkedEntitiesActions = values(pendingActions).reduce((res, actions) => {
    return res.concat(actions)
  }, [])

  const submitLinkedEntitiesActions = () => {
    onBatchActions(pendingLinkedEntitiesActions, selectedLinkedEntities)
    resetLinkedEntitiesActions()
  }

  /**
   * tags related
   */
  
  const userTags = webentity.tags[TAGS_NS]
  const initialTags = categories.map((category) => {
    return {
      category,
      value: (userTags[category] && userTags[category][0]) || ''
    }
  })
                                        
  /**
   * field notes related
   */
  const onAddNote = (note) => onAddTag('FREETAGS', note)
  const onRemoveNote = (note) => onRemoveTag('FREETAGS', note)

  const handleSetTabHomepage = () => onSetTabUrl(webentity.homepage)

  return (
    <div className="browse-layout">
      <nav className="browse-nav">
        <button className="hint--right" aria-label={ formatMessage({ id: 'tooltip.stack-prev' }, { stack: webentity.status }) }><i className="ti-angle-left" /></button>
        <span className="current-webentity-name" onClick={ handleSetTabHomepage }>{webentity.name}</span>
        <button className="hint--left" aria-label={ formatMessage({ id: 'tooltip.stack-next' }, { stack: webentity.status }) }><i className="ti-angle-right" /></button>
      </nav>
      <div className="browse-edition-container">
        
        <EditionCartel
          isOpen={ statusOpen }
          onToggle={ () => setStatusOpen(!statusOpen) }
          title={ formatMessage({ id: 'sidebar.cartel.webentity-status-title' }) }
          help={ formatMessage({ id: 'sidebar.cartel.webentity-status-help' }) }
          helpPlace={ 'right' }
          isAlwaysOpen={  webentity.status === 'DISCOVERED' }
        >
          <ul className="set-status-container">
            <li className={ webentity.status === 'IN' ? 'in' : '' } onClick={ () => setModalIsOpen(true) }>IN<HelpPin>{formatMessage({ id: 'sidebar.cartel.webentity-status-help.IN' })}</HelpPin></li>
            <li 
              className={ webentity.status === 'UNDECIDED' ? 'undecided' : '' }
              onClick={ () => onSetWebentityStatus('UNDECIDED') }>
                UND.<HelpPin place="bottom">{formatMessage({ id: 'sidebar.cartel.webentity-status-help.UND' })}</HelpPin>
            </li>
            <li 
              className={ webentity.status === 'OUT' ? 'out' : '' }
              onClick={ () => onSetWebentityStatus('OUT') }>
                OUT<HelpPin place="left">{formatMessage({ id: 'sidebar.cartel.webentity-status-help.IN' })}</HelpPin>
            </li>
          </ul>
        </EditionCartel>
  
        <EditionCartel
          isOpen={ nameOpen }
          onToggle={ () => setNameOpen(!nameOpen) }
          title={ formatMessage({ id: 'sidebar.cartel.webentity-name-title' }) }
          help={ formatMessage({ id: 'sidebar.cartel.webentity-name-help' }) }
          isAlwaysOpen={ webentity.status === 'DISCOVERED' }
        >
          <WebentityNameField 
            initialName={ webentity.name }
            onSubmit={ onSetWebentityName } />
        </EditionCartel>
        <EditionCartel
          isOpen={ knownPagesOpen }
          onToggle={ () => setKnownPagesOpen(!knownPagesOpen) }
          title={ formatMessage({ id: 'sidebar.cartel.known-webpages-title' }) }
          help={ formatMessage({ id: 'sidebar.cartel.known-webpages-help' }) }
        >
          {
            webentity.mostLinked ?
              <KnownPages 
                list={ webentity.mostLinked }
                tabUrl={ tabUrl }
                homepage={ webentity.homepage }
                onDownloadList={ onDownloadList }
                onSetTabUrl= { onSetTabUrl }
                onSetHomepage = { onSetWebentityHomepage } />:
              <T id="loading" />
          }
        </EditionCartel>
        <EditionCartel
          isOpen={ linkedEntitiesOpen }
          onToggle={ () => setLinkedEntitiesOpen(!linkedEntitiesOpen) }
          title={ formatMessage({ id: 'sidebar.cartel.linked-webentities-title' }) }
          help={ formatMessage({ id: 'sidebar.cartel.linked-webentities-help' }) }
        >
          {
            webentity[selectedLinkedEntities] ?
              <LinkedWebentities 
                {
                ...{
                  setSelected: setSelectedLinkedEntities,
                  selected: selectedLinkedEntities,
                  list: webentity[selectedLinkedEntities],
                  resetActions: resetLinkedEntitiesActions,
                  submitActions: submitLinkedEntitiesActions,
                  pendingActions: pendingLinkedEntitiesActions,
                  
                  statusActions,
                  setStatusActions,
                  mergeActions: mergeLinkedEntitiesActions, 
                  setMergeActions: setMergeLinkedEntitiesActions,
                  onDownloadList,
                  onOpenTab
                }
                }
              />:
              <T id="loading" />
          }
        </EditionCartel>
        <EditionCartel
          isOpen={ tagsOpen }
          onToggle={ () => setTagsOpen(!tagsOpen) }
          title={ formatMessage({ id: 'sidebar.cartel.tags-title' }) }
          helpPlace={ 'right' }
          help={ formatMessage({ id: 'sidebar.cartel.tags-help' }) }
        >
          <Tags 
            {
            ...{
              webentityId: webentity.id,
              initialTags,
              suggestions: tagsSuggestions,
              onAddTag,
              onRemoveTag
            }
            }
          />
        </EditionCartel>
        <EditionCartel
          isOpen={ notesOpen }
          onToggle={ () => setNotesOpen(!notesOpen) }
          title={ formatMessage({ id: 'sidebar.cartel.field-notes-title' }) }
          help={ formatMessage({ id: 'sidebar.cartel.field-notes-help' }) }
          helpPlace="top"
        >
          <FieldNotes
            {
            ...{
              webentityId: webentity.id,
              initialNotes: (userTags && userTags['FREETAGS']) || [], 
              onAddNote,
              onRemoveNote
            }
            }
          />
        </EditionCartel>
        {/* <EntityModal
          isOpen={ modalIsOpen }
          onToggle={ () => setModalIsOpen(false) }
        /> */}
      </div>    
    </div>
  )
}

WebentityBrowseLayout.contextTypes = {
  intl: intlShape
}

export default WebentityBrowseLayout