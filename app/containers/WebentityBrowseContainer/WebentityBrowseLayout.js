import './WebentityBrowseLayout.styl'

import React, { useState } from 'react'
import cx from 'classnames'
import { FormattedMessage as T, useIntl } from 'react-intl'
import pickBy from 'lodash/fp/pickBy'

import { TAGS_NS } from '../../constants'

import { ellipseStr } from '../../utils/misc'

import EditionCartel from '../../components/EditionCartel'
import FieldNotes from '../../components/FieldNotes'
import LinkedWebentities from '../../components/LinkedWebentities'
import KnownPages from '../../components/KnownPages'
import Tags from '../../components/Tags'
import Tooltipable from '../../components/Tooltipable'

import HelpPin from '../../components/HelpPin'
import WebentityNameField from './WebentityNameField'

const pickByIdentity = pickBy(v => v)

const WebentityBrowseLayout = ({
  webentity,
  tlds,
  webentitiesList,
  initialStatus,
  viewedSuggestionIds,
  navigationHistory,
  selectedStack,
  selectedWebentity,
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
  onFetchKnownPages,
  onFetchLinkedEntities,
  onSetWebentityName,
  onSetWebentityHomepage,
  onAddTag,
  onUpdateTag,
  onRemoveTag,
  cartels,
  setCartels,
}) => {
  const { formatMessage } = useIntl()

  /**
   * Linked entities related
   */
  const [selectedLinkedEntities, setSelectedLinkedEntities] = useState('referrers')
  const [statusActions, setStatusActions] = useState({})

  /**
   * browse nav related
   */

  const formatStackName = stackName => {
    if (stackName === 'DISCOVERED') {
      return 'SUGGESTIONS'
    }
    return stackName
  }

  /**
  * used by Prev (-1) / Next (+1) buttons
  */
  const rotateWebentity = (offset) => {
    // locate index if current webentity is in the stack list,
    // otherwise get index of last viewed webenetity from the list
    let idx = webentitiesList.findIndex(x => x.id === webentity.id)
    if (idx=== -1) idx = webentitiesList.findIndex(x => x.id === selectedWebentity.id)
    let findWebentity
    if (idx === -1) {
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

  const pendingActions = React.useMemo(() =>
    Object.keys(pickByIdentity(statusActions)).map((key) =>  {
      return {
        id: +key,
        type: pickByIdentity(statusActions)[key].status,
        prevStatus: pickByIdentity(statusActions)[key].prevStatus
      }
    }), [statusActions],
  )

  const submitLinkedEntitiesActions = (actions) => {
    if (actions.length > 0) {
      onBatchActions(actions, selectedLinkedEntities)
    }
    resetLinkedEntitiesActions()
  }

  /**
   * tags related
   */

  const userTags = webentity && webentity.tags && webentity.tags[TAGS_NS]
  const initialTags = React.useMemo(() => categories.map((category) => ({
    category,
    value: (userTags && userTags[category] && userTags[category][0]) || ''
  })), [categories, userTags])

  /**
   * field notes related
   */
  const onAddNote = (note) => onAddTag('FREETAGS', note)
  const onUpdateNote = (oldNote, newNote) => onUpdateTag('FREETAGS', oldNote, newNote)
  const onRemoveNote = (note) => onRemoveTag('FREETAGS', note)

  const notOnHomepage = webentity.homepage && (webentity.homepage !== tabUrl && `${webentity.homepage}/` !== tabUrl )
  const handleSetTabHomepage = () => {
    if (!webentity.homepage) return
    if (notOnHomepage) {
      onSetTabUrl(webentity.homepage)
    }
  }

  const prevDisabled = !selectedStack || isFirst || loadingStack || loadingWebentity
  const nextDisabled = !selectedStack || isLast  || loadingStack || loadingWebentity
  return (
    <div className="browse-layout">
      <nav className="browse-nav">
        { !prevDisabled &&
        <Tooltipable
          Tag="button"
          className={ cx('stack-nav-btn', formatStackName(selectedStack), 'hint--right') }
          onClick={ goPrevWebentity }
          aria-label={ formatMessage({ id: 'tooltip.stack-prev' }, { stack: formatStackName(selectedStack) }) }
        >
          <i className="ti-angle-left" />
        </Tooltipable> }
        <span
          className={ cx('current-webentity-name hint--bottom', { 'clickable':  notOnHomepage }) }
          onClick={ handleSetTabHomepage }
          aria-label={ notOnHomepage ? formatMessage({ id: 'go-to-homepage' }) : webentity.name }
        >
          {ellipseStr(webentity.name, 20)}
          <span className="current-webentity-stack-indicators">
            {
              webentity.status !== initialStatus
            &&
            <>
              <span className={ cx('current-webentity-stack-indicator', formatStackName(initialStatus)) }>{formatStackName(initialStatus)}</span>
              <span className="arrow ti-arrow-right" />
            </>
            }
          </span>
          <span className={ cx('current-webentity-stack-indicator', formatStackName(webentity.status)) }>{formatStackName(webentity.status)}</span>

        </span>

        { !nextDisabled &&
        <Tooltipable
          Tag="button"
          className={ cx('stack-nav-btn', formatStackName(selectedStack), 'hint--right') }
          onClick={ goNextWebentity }
          aria-label={ formatMessage({ id: 'tooltip.stack-next' }, { stack: formatStackName(selectedStack) }) }
        >
          <i className="ti-angle-right" />
        </Tooltipable> }
      </nav>
      <ul className="browse-edition-container">

        <EditionCartel
          isOpen={ cartels.status }
          onToggle={ () => setCartels('status', !cartels.status) }
          title={ formatMessage({ id: 'sidebar.cartel.webentity-status-title' }) }
          help={ formatMessage({ id: 'sidebar.cartel.webentity-status-help' }) }
          helpPlace={ 'right' }
        >
          <ul className="set-status-container">
            <li
              className={ webentity.status === 'IN' ? 'in' : '' }
              // onClick={ () => setModalIsOpen(true)}
              onClick={ () => onSetWebentityStatus('IN') }
            >
              <span className="set-status-container-text">IN</span>
              <HelpPin>{formatMessage({ id: 'sidebar.cartel.webentity-status-help.IN' })}</HelpPin>
            </li>
            <li
              className={ webentity.status === 'UNDECIDED' ? 'undecided' : '' }
              onClick={ () => onSetWebentityStatus('UNDECIDED') }
            >
              <span className="set-status-container-text">UND.</span>
              <HelpPin place="right">{formatMessage({ id: 'sidebar.cartel.webentity-status-help.UND' })}</HelpPin>
            </li>
            <li
              className={ webentity.status === 'OUT' ? 'out' : '' }
              onClick={ () => onSetWebentityStatus('OUT') }
            >
              <span className="set-status-container-text">OUT</span>
              <HelpPin place="right">{formatMessage({ id: 'sidebar.cartel.webentity-status-help.OUT' })}</HelpPin>
            </li>
          </ul>
        </EditionCartel>

        <EditionCartel
          isOpen={ cartels.name }
          onToggle={ () => setCartels('name', !cartels.name) }
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
          isOpen={ cartels.knownPages }
          onToggle={ () => setCartels('knownPages', !cartels.knownPages) }
          title={ formatMessage({ id: 'sidebar.cartel.known-webpages-title' }, { count: webentity.pages_total }) }
          help={ formatMessage({ id: 'sidebar.cartel.known-webpages-help' }) }
        >
          {
            webentity.paginatePages ?
              <KnownPages
                list={ webentity.paginatePages }
                navigationHistory={ navigationHistory }
                tabUrl={ tabUrl }
                homepage={ webentity.homepage }
                isPaginating={ webentity.token }
                totalPages={ webentity.pages_total }
                updateList= { onFetchKnownPages }
                onDownloadList={ onDownloadList }
                onSetTabUrl= { onSetTabUrl }
                onSetHomepage = { onSetWebentityHomepage }
              />:
              <T id="loading" />
          }
        </EditionCartel>
        <EditionCartel
          isOpen={ cartels.linkedentities }
          onToggle={ () => setCartels('linkedentities', !cartels.linkedentities) }
          title={ formatMessage({ id: 'sidebar.cartel.linked-webentities-title' }, { count: webentity.undirected_degree }) }
          help={ formatMessage({ id: 'sidebar.cartel.linked-webentities-help' }) }
        >
          {
            webentity[selectedLinkedEntities] ?
              <div className="linked-entities-wrapper">
                <nav className="list-toggle">
                  {
                    ['referrers', 'referrals'].map((l, index) => {
                      const handleSelectContextualList = () => {
                        setSelectedLinkedEntities(l)
                        resetLinkedEntitiesActions()
                      }
                      const count = webentity[l] && webentity[l].length || 0
                      return (
                        <button
                          className={ cx('btn', 'btn-default', 'navigation', { 'is-selected': l === selectedLinkedEntities }) }
                          key={ index }
                          onClick={ handleSelectContextualList }
                        >
                          <span className="list-toggle-title">
                            <T id={ `sidebar.contextual.${l}` } values={ { count } } />
                          </span>
                          <HelpPin>
                            {formatMessage({ id: `sidebar.contextual.${l}-help` })}
                          </HelpPin>
                        </button>
                      )
                    }
                    ) }
                </nav>
                <LinkedWebentities
                  {
                  ...{
                    webentity,
                    key: `${webentity.id}-${selectedLinkedEntities}`,
                    tlds,
                    linkedEntities: selectedLinkedEntities,
                    linkedEntitiesList: webentity[selectedLinkedEntities],
                    resetActions: resetLinkedEntitiesActions,
                    submitActions: submitLinkedEntitiesActions,
                    pendingActions,
                    loadingBatchActions,
                    viewedSuggestionIds,
                    updateList: onFetchLinkedEntities,
                    statusActions,
                    setStatusActions,
                    onDownloadList,
                    onOpenTab
                  }
                  }
                />
              </div> : <T id="loading" />
          }
        </EditionCartel>
        <EditionCartel
          isOpen={ cartels.tags }
          onToggle={ () => setCartels('tags', !cartels.tags) }
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
          isOpen={ cartels.notes }
          onToggle={ () => setCartels('notes', !cartels.notes) }
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
      </ul>
    </div>
  )
}

export default WebentityBrowseLayout
