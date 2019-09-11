import './WebentityBrowseLayout.styl'

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { FormattedMessage as T, intlShape } from 'react-intl'
import { pickBy } from 'lodash'

import { TAGS_NS } from '../../constants'

import {ellipseStr} from '../../utils/misc'

import EditionCartel from '../../components/EditionCartel'
import FieldNotes from '../../components/FieldNotes'
import LinkedWebentities from '../../components/LinkedWebentities'
import KnownPages from '../../components/KnownPages'
import Tags from '../../components/Tags'
import Tooltipable from '../../components/Tooltipable'
import Spinner from '../../components/Spinner'
// import EntityModal from '../../components/EntityModalMock'

import HelpPin from '../../components/HelpPin'
import WebentityNameField from './WebentityNameField'

const WebentityBrowseLayout = ({
  webentity,
  webentitiesList,
  initialStatus,
  viewedProspectionIds,
  selectedStack,
  loadingStack,
  loadingWebentity,
  loadingBatchActions,
  tabUrl,
  categories,
  tagsSuggestions,
  onSelectWebentity,
  onDownloadList,
  onSetWebentityStatus,
  onSetTabUrl,
  onOpenTab,
  onBatchActions,
  onSetWebentityName,
  onSetWebentityHomepage,
  onAddTag,
  onUpdateTag,
  onRemoveTag,

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
  const [statusActions, setStatusActions] = useState({})
  

  /**
   * Display loading bar if no we is provided
   */
  if (!webentity) {
    return <div className="loader-container"><Spinner /></div>
  }

  /**
   * browse nav related
   */

  const formatStackName = stackName => {
    if (stackName === 'DISCOVERED') {
      return 'PROSPECTION'
    }
    return stackName
  }

  // used by Prev (-1) / Next (+1) buttons
  const rotateWebentity = (offset) => {
    const idx = webentitiesList.findIndex(x => x.id === webentity.id)
    let findWebentity
    if (idx === -1) {
      // TODO: case webentity is not found in stack fetched, cause "DISCOVERED" list limit is 200
      findWebentity = webentitiesList[0]
    } else if (idx === 0 && offset === -1) {
      findWebentity = webentitiesList[webentitiesList.length - 1]
    }else if (idx === webentitiesList.length - 1 && offset === 1) {
      findWebentity = webentitiesList[0]
    } else {
      findWebentity = webentitiesList[idx + offset]
    }
    onSelectWebentity(findWebentity)
  }

  // disable next / prev
  const isFirst = webentitiesList && webentitiesList.length && webentity &&
  webentity.id === webentitiesList[0].id
  const isLast = webentitiesList && webentitiesList.length && webentity &&
    webentity.id === webentitiesList[webentitiesList.length - 1].id
  const goNextWebentity = () => rotateWebentity(1)
  const goPrevWebentity = () => rotateWebentity(-1)


  
  const resetLinkedEntitiesActions = () => {
    setStatusActions({})
  }
  
  const pendingActions = Object.keys(pickBy(statusActions, v => v)).map((key) =>  {
    return {
      id: +key,
      type: pickBy(statusActions, v => v)[key]
    }
  })

  const submitLinkedEntitiesActions = () => {
    onBatchActions(pendingActions, selectedLinkedEntities)
    resetLinkedEntitiesActions()
  }

  /**
   * tags related
   */
  
  const userTags = webentity.tags[TAGS_NS]
  const initialTags = categories.map((category) => {
    return {
      category,
      value: (userTags && userTags[category] && userTags[category][0]) || ''
    }
  })
                                        
  /**
   * field notes related
   */
  const onAddNote = (note) => onAddTag('FREETAGS', note)
  const onUpdateNote = (oldNote, newNote) => onUpdateTag('FREETAGS', oldNote, newNote)
  const onRemoveNote = (note) => onRemoveTag('FREETAGS', note)

  const notOnHomepage = webentity.homepage && (webentity.homepage !== tabUrl && `${webentity.homepage}/` !== tabUrl ) ;
  const handleSetTabHomepage = () => {
    if (!webentity.homepage) return
    if (notOnHomepage) {
      onSetTabUrl(webentity.homepage)
    }
  }

  const prevDisabled = !selectedStack ||  isFirst || loadingStack || loadingWebentity;
  const nextDisabled = !selectedStack || isLast || loadingStack || loadingWebentity;
  return (
    <div className="browse-layout">
      <nav className="browse-nav">
        <Tooltipable 
          Tag="button"
          className={cx('stack-nav-btn', formatStackName(selectedStack), {"hint--right": !prevDisabled })}
          onClick={ goPrevWebentity }
          disabled={ prevDisabled }
          aria-label={ !prevDisabled ? formatMessage({ id: 'tooltip.stack-prev' }, { stack: formatStackName(selectedStack) }) : null }>
          <i className="ti-angle-left" />
        </Tooltipable>
        <span 
          title={webentity.name} 
          className={cx("current-webentity-name", {'clickable':  notOnHomepage, 'hint--bottom': notOnHomepage }) }
          onClick={ handleSetTabHomepage }
          aria-label={notOnHomepage ? formatMessage({id: 'go-to-homepage'}) : null }
        >
          {ellipseStr(webentity.name, 20)}
          <span className="current-webentity-stack-indicators">
          {
            webentity.status !== initialStatus
            &&
            <>
              <span className={cx("current-webentity-stack-indicator", formatStackName(initialStatus))}>{formatStackName(initialStatus)}</span>
              <span className="arrow ti-arrow-right"/>
            </>
          }
          </span>
          <span className={cx("current-webentity-stack-indicator", formatStackName(webentity.status))}>{formatStackName(webentity.status)}</span>
         
        </span>
        
        <Tooltipable 
          Tag="button"
          className={cx('stack-nav-btn', formatStackName(selectedStack), {"hint--right": !nextDisabled })}
          onClick={ goNextWebentity }
          disabled={ nextDisabled }
          aria-label={ !nextDisabled ? formatMessage({ id: 'tooltip.stack-next' }, { stack: formatStackName(selectedStack) }) : null }>
          <i className="ti-angle-right" />
        </Tooltipable>
      </nav>
      <ul className="browse-edition-container">
        
        <EditionCartel
          isOpen={ statusOpen }
          onToggle={ () => setStatusOpen(!statusOpen) }
          title={ formatMessage({ id: 'sidebar.cartel.webentity-status-title' }) }
          help={ formatMessage({ id: 'sidebar.cartel.webentity-status-help' }) }
          helpPlace={ 'right' }
        >
          <ul className="set-status-container">
            <li 
              className={ webentity.status === 'IN' ? 'in' : '' } 
              // onClick={ () => setModalIsOpen(true)}
              onClick={ () => onSetWebentityStatus('IN')  }>
                IN<HelpPin>{formatMessage({ id: 'sidebar.cartel.webentity-status-help.IN' })}</HelpPin>
            </li>
            <li 
              className={ webentity.status === 'UNDECIDED' ? 'undecided' : '' }
              onClick={ () => onSetWebentityStatus('UNDECIDED') }>
                UND.<HelpPin place="right">{formatMessage({ id: 'sidebar.cartel.webentity-status-help.UND' })}</HelpPin>
            </li>
            <li 
              className={ webentity.status === 'OUT' ? 'out' : '' }
              onClick={ () => onSetWebentityStatus('OUT') }>
                OUT<HelpPin place="right">{formatMessage({ id: 'sidebar.cartel.webentity-status-help.OUT' })}</HelpPin>
            </li>
          </ul>
        </EditionCartel>
  
        <EditionCartel
          isOpen={ nameOpen }
          onToggle={ () => setNameOpen(!nameOpen) }
          title={ formatMessage({ id: 'sidebar.cartel.webentity-name-title' }) }
          help={ formatMessage({ id: 'sidebar.cartel.webentity-name-help' }) }
        >
          <WebentityNameField 
            initialName={ webentity.name }
            onSubmit={ onSetWebentityName } 
            id={ webentity.id }
          />
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
                  pendingActions,
                  loadingBatchActions,
                  viewedProspectionIds,
                  
                  statusActions,
                  setStatusActions,
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
              onUpdateTag,
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
              initialNotes: (userTags && userTags['FREETAGS'] && userTags['FREETAGS']) || [], 
              onAddNote,
              onUpdateNote,
              onRemoveNote
            }
            }
          />
        </EditionCartel>
        {/* <EntityModal
          isOpen={ modalIsOpen }
          onToggle={ () => setModalIsOpen(false) }
        /> */}
      </ul>    
    </div>
  )
}

WebentityBrowseLayout.contextTypes = {
  intl: intlShape
}

export default WebentityBrowseLayout
