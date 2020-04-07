import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Spinner from '../../components/Spinner'

import { 
  setWebentityName, 
  setWebentityHomepage,
  showAdjustWebentity,
  cancelWebentityCrawls,
  batchWebentityActions,
  setSimpleTabWebentity,
  setWebentityStatus } from '../../actions/webentities'

import { viewWebentity, fetchStack, selectStack } from '../../actions/stacks'

import { setTabUrl, openTab } from '../../actions/tabs'
import { addTag, removeTag, updateTag } from '../../actions/tags'

import { getWebEntityActivityStatus } from '../../utils/status'

import WebentityBrowseLayout from './WebentityBrowseLayout'

import { fieldParser, flatTag, downloadFile } from '../../utils/file-downloader'
const empty = {}

const WebentityBrowseContainer = ({ 
  activeTab, 
  corpusId,
  serverUrl,
  webentities,
  selectedStack,
  stackWebentities,
  loadingStack,
  loadingWebentity,
  loadingBatchActions,
  categories,
  tagsSuggestions,
  tlds,
  stacks,
  // actions
  setTabUrl,
  openTab,
  setWebentityName,
  setWebentityStatus,
  showAdjustWebentity,
  cancelWebentityCrawls,
  viewWebentity,
  batchWebentityActions,
  setWebentityHomepage,
  addTag,
  updateTag,
  removeTag,
  setSimpleTabWebentity,
}) => {
  const webentity = webentities && webentities.webentities[webentities.tabs[activeTab.id]]
  const [initialStatus, setInitialStatus] = useState(webentity && webentity.status)

  // storing viewed prospections in an efficient way
  let viewedProspectionIds = stacks && stacks.webentities.DISCOVERED 
  && stacks.webentities.DISCOVERED.webentities.filter(e => e.viewed).map(e => e.id)
  viewedProspectionIds = new Set(viewedProspectionIds)

  useEffect(() => {
    if (webentity) {
      setInitialStatus(webentity.status)
    }
  }, [webentity && webentity.id])

  const webentitiesList = selectedStack && stackWebentities[selectedStack] ? stackWebentities[selectedStack].webentities : []

  const handleSelectWebentity = (webentity) => {
    viewWebentity(webentity)
    setSimpleTabWebentity(webentity, activeTab.id)
    setTabUrl(webentity.homepage, activeTab.id)
  }
  
  const handleDownloadList = (list) => {
    let listName
    switch (list) {
    case 'mostLinked':
      listName = 'mostLinkedPages'
      break
    case 'referrers':
      listName = 'citingWebEntities'
      break
    case 'referrals':
      listName = 'citedWebEntities'
      break
    case 'parents':
      listName = 'parentWebEntities'
      break
    case 'children':
      listName = 'childrenWebEntities'
      break
    default:
      listName = list
      break
    }
    // eslint-disable-next-line no-useless-escape
    const webentityName = webentity.name.replace(/[\s\/]/g, '_')
    const parsedWebentity = webentity[list].map((we) => {
      return we.tags ? fieldParser(we, tlds, 'csv') : we
    })

    const flatList = flatTag(parsedWebentity)
    const fileName = `${corpusId}_${webentityName}_${listName}`
    downloadFile(flatList, fileName, 'csv')
  }
  
  const handleSetWebentityName = (name) => setWebentityName(serverUrl, corpusId, name, webentity.id)
  const handleSetWebentityHomepage = (url) => setWebentityHomepage(serverUrl, corpusId, url, webentity.id)
  
  const handleSetWenentityStatus = (status, we = webentity) => {
    const crawling = !!~['PENDING', 'RUNNING'].indexOf(getWebEntityActivityStatus(we))

    if (status !== 'DISCOVERED' && status === we.status) {
      // Click on current status = set to discovered
      status = 'DISCOVERED'
    }

    if (status === 'IN' && !crawling) {
      // Set to IN = go to "adjust" mode and validation triggers crawling
      showAdjustWebentity(we.id, true, false)
    } else {
      setWebentityStatus(serverUrl, corpusId, status, we.id)
    }

    if (status === 'OUT' && crawling) {
      cancelWebentityCrawls(serverUrl, corpusId, we.id)
    }
  }

  const handleSetTabUrl = (url) => setTabUrl(url, activeTab.id)
  const handleOpenTab = (url) => openTab(url, activeTab.id)
  const handleBatchActions = (actions, selectedList) => batchWebentityActions({ actions, serverUrl, corpusId, webentity, selectedList })

  const handleAddTag = (category, value) => addTag(serverUrl, corpusId, category, webentity.id, value)
  const handleUpdateTag = (category, oldValue, newValue) => updateTag(serverUrl, corpusId, category, webentity.id, oldValue, newValue)
  const handleRemoveTag = (category, value) => removeTag(serverUrl, corpusId, category, webentity.id, value)
  const filteredCategories = React.useMemo(() => categories.filter(cat => cat !== 'FREETAGS'), [categories])

  const [cartels, dispatchCartels] = React.useReducer(
    (state, action) => ({
      ...state,
      [action.type]: action.payload
    }), {
      tags: false,
      notes: false,
      knownPages: false,
      linkedentities: false,
      name: true,
      status: true,
    }
  )

  const setCartels = React.useCallback((type, status) =>
    dispatchCartels({
      type,
      payload: status
    })
  , [])

  /**
   * Display loading bar if no we is provided
   */
  if (!webentity) {
    return <div className="loader-container"><Spinner /></div>
  }
  return (
    <WebentityBrowseLayout
      webentity={ webentity }
      viewedProspectionIds={ viewedProspectionIds }
      stackWebentities={ stackWebentities }
      initialStatus={ initialStatus }
      webentitiesList= { webentitiesList }
      selectedStack={ selectedStack }
      loadingStack={ loadingStack }
      loadingWebentity= { loadingWebentity }
      loadingBatchActions = { loadingBatchActions }
      tabUrl={ activeTab.url }
      categories={ filteredCategories }
      tagsSuggestions={ tagsSuggestions || empty }
      onSelectWebentity={ handleSelectWebentity }
      onDownloadList={ handleDownloadList }
      onSetTabUrl={ handleSetTabUrl }
      onOpenTab={ handleOpenTab }
      onAddTag={ handleAddTag }
      onUpdateTag={ handleUpdateTag }
      onRemoveTag={ handleRemoveTag }
      onBatchActions = { handleBatchActions }
      onSetWebentityStatus={ handleSetWenentityStatus }
      onSetWebentityName={ handleSetWebentityName }
      onSetWebentityHomepage={ handleSetWebentityHomepage }
      cartels={ cartels }
      setCartels={ setCartels }
    />
  )
}


WebentityBrowseContainer.propTypes = {
  activeTab: PropTypes.object.isRequired,
  webentities: PropTypes.object.isRequired,
  tlds: PropTypes.object,
  corpusId: PropTypes.string,
  serverUrl: PropTypes.string,

  // actions
  openTab: PropTypes.func,
  setTabUrl: PropTypes.func,
  setWebentityName: PropTypes.func,
  setWebentityStatus: PropTypes.func,
  setWebentityHomepage: PropTypes.func
}

const mapStateToProps = ({ corpora, servers, stacks, webentities, tabs, ui: { loaders } }) => ({
  corpusId: corpora.selected.corpus_id,
  activeTab: tabs.activeTab,
  webentities,
  stacks,
  selectedStack: stacks.selected,
  stackWebentities: stacks.webentities,
  tlds: webentities.tlds,
  loadingStack: stacks.loading,
  loadingWebentity: stacks.loadingWebentity,
  loadingBatchActions: loaders.webentity_batch_actions,
  categories: corpora.list[corpora.selected.corpus_id].tagsCategories || [],
  tagsSuggestions: corpora.tagsSuggestions[corpora.selected.corpus_id] || {},
  serverUrl: servers.selected.url
})


export default connect(mapStateToProps, {
  openTab,
  setTabUrl,
  setWebentityName,
  setWebentityStatus,
  showAdjustWebentity,
  cancelWebentityCrawls,
  viewWebentity,
  fetchStack,
  selectStack,
  batchWebentityActions,
  setWebentityHomepage,
  addTag,
  updateTag,
  removeTag,
  setSimpleTabWebentity,
})(React.memo(WebentityBrowseContainer))
