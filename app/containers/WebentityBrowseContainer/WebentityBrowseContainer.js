import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { 
  setWebentityName, 
  setWebentityHomepage,
  showAdjustWebentity,
  cancelWebentityCrawls,
  batchWebentityActions,
  setWebentityStatus } from '../../actions/webentities'
import { setTabUrl, openTab } from '../../actions/tabs'
import { addTag, removeTag } from '../../actions/tags'

import { getWebEntityActivityStatus } from '../../utils/status'

import WebentityBrowseLayout from './WebentityBrowseLayout'

import { fieldParser, flatTag, downloadFile } from '../../utils/file-downloader'

const WebentityBrowseContainer = ({ 
  activeTab, 
  corpusId,
  serverUrl,
  webentities,
  categories,
  tagsSuggestions,
  tlds,
  // actions
  setTabUrl,
  openTab,
  setWebentityName,
  setWebentityStatus,
  showAdjustWebentity,
  cancelWebentityCrawls,
  batchWebentityActions,
  setWebentityHomepage,
  addTag,
  removeTag,
}) => {
  const webentity = webentities && webentities.webentities[webentities.tabs[activeTab.id]]
  
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
    const webentityName = webentity.name.replace(/[\s\/]/g, '_')
    const parsedWebentity = webentity[list].map(
      (we) => we.tags ? fieldParser(we, tlds, 'csv') : we
    )

    const flatList = flatTag(parsedWebentity)
    const fileName = `${corpusId}_${webentityName}_${listName}`
    downloadFile(flatList, fileName, 'csv')
  }
  
  const handleSetWebentityName = (name) => setWebentityName(serverUrl, corpusId, name, webentity.id)
  const handleSetWebentityHomepage = (url) => setWebentityHomepage(serverUrl, corpusId, url, webentity.id)
  
  const handleSetWenentityStatus = (status) => {
    const crawling = !!~['PENDING', 'RUNNING'].indexOf(getWebEntityActivityStatus(webentity))

    if (status !== 'DISCOVERED' && status === webentity.status) {
      // Click on current status = set to discovered
      status = 'DISCOVERED'
    }

    if (status === 'IN' && !crawling) {
      // Set to IN = go to "adjust" mode and validation triggers crawling
      showAdjustWebentity(webentity.id, true)
    } else {
      setWebentityStatus(serverUrl, corpusId, status, webentity.id)
    }

    if (status === 'OUT' && crawling) {
      cancelWebentityCrawls(serverUrl, corpusId, webentity.id)
    }
  }

  const handleSetTabUrl = (url) => setTabUrl(url, activeTab.id)
  const handleOpenTab = (url) => openTab(url, activeTab.id)
  const handleBatchActions = (actions, selectedList) => batchWebentityActions(actions, serverUrl, corpusId, webentity, selectedList)
  
  const handleAddTag = (category, value) => addTag(serverUrl, corpusId, category, webentity.id, value)
  const handleRemoveTag = (category, value) => removeTag(serverUrl, corpusId, category, webentity.id, value)

  if (!webentity) return null
  return (<WebentityBrowseLayout
    webentity={ webentity }
    tabUrl={ activeTab.url }
    categories={ categories.filter(cat => cat !== 'FREETAGS') }
    tagsSuggestions={ tagsSuggestions || {} }
    onDownloadList={ handleDownloadList }
    onSetTabUrl={ handleSetTabUrl }
    onOpenTab={ handleOpenTab }
    onAddTag={ handleAddTag }
    onRemoveTag={ handleRemoveTag }
    onBatchActions = { handleBatchActions }
    onSetWebentityStatus={ handleSetWenentityStatus }
    onSetWebentityName={ handleSetWebentityName }
    onSetWebentityHomepage={ handleSetWebentityHomepage } />)
}


WebentityBrowseContainer.propTypes = {
  activeTab: PropTypes.object.isRequired,
  webentities: PropTypes.object.isRequired,
  tlds: PropTypes.object.isRequired,
  corpusId: PropTypes.string,
  serverUrl: PropTypes.string,

  // actions
  openTab: PropTypes.func,
  setTabUrl: PropTypes.func,
  setWebentityName: PropTypes.func,
  setWebentityStatus: PropTypes.func,
  setWebentityHomepage: PropTypes.func
}

const mapStateToProps = ({ corpora, servers, webentities, tabs }) => ({
  corpusId: corpora.selected.corpus_id,
  activeTab: tabs.activeTab,
  webentities,
  tlds: webentities.tlds,
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
  batchWebentityActions,
  setWebentityHomepage,
  addTag,
  removeTag
})(WebentityBrowseContainer)

