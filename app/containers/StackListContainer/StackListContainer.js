import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { 
  batchWebentityActions
} from '../../actions/webentities'

import { viewWebentity, fetchStack } from '../../actions/stacks'

import { setTabUrl, openTab } from '../../actions/tabs'
import { addTag, removeTag, updateTag } from '../../actions/tags'

import StackListLayout from './StackListLayout'

import { fieldParser, flatTag, downloadFile } from '../../utils/file-downloader'

const StackListContainer = ({ 
  activeTab, 
  corpusId,
  status,
  serverUrl,
  webentities,
  selectedStack,
  stackFilter,
  stackWebentities,
  loadingStack,
  loadingWebentity,
  loadingBatchActions,
  tlds,
  // actions
  fetchStack,
  setTabUrl,
  openTab,
  viewWebentity,
  batchWebentityActions,
}) => {

  const handleSelectWebentity = (webentity) => {
    viewWebentity(webentity)
    setTabUrl(webentity.homepage, activeTab.id)
  }
  
  // const handleDownloadList = (list) => {
  //   let listName
  //   switch (list) {
  //   case 'mostLinked':
  //     listName = 'mostLinkedPages'
  //     break
  //   case 'referrers':
  //     listName = 'citingWebEntities'
  //     break
  //   case 'referrals':
  //     listName = 'citedWebEntities'
  //     break
  //   case 'parents':
  //     listName = 'parentWebEntities'
  //     break
  //   case 'children':
  //     listName = 'childrenWebEntities'
  //     break
  //   default:
  //     listName = list
  //     break
  //   }
  //   const webentityName = webentity.name.replace(/[\s\/]/g, '_')
  //   const parsedWebentity = webentity[list].map(
  //     (we) => we.tags ? fieldParser(we, tlds, 'csv') : we
  //   )

  //   const flatList = flatTag(parsedWebentity)
  //   const fileName = `${corpusId}_${webentityName}_${listName}`
  //   downloadFile(flatList, fileName, 'csv')
  // }

  const handleFetchStack = (stack, filter) => {
    fetchStack(serverUrl, corpusId, stack, filter)
  }

  const handleSetTabUrl = (url) => setTabUrl(url, activeTab.id)
  const handleOpenTab = (url) => openTab(url, activeTab.id)
  const handleBatchActions = (actions, selectedList) => batchWebentityActions({ actions, serverUrl, corpusId, selectedList })
  
  const counters = status.corpus.traph.webentities
  const tabWebentity = webentities && webentities.webentities[webentities.tabs[activeTab.id]]

  if (!selectedStack) return null
  return (<StackListLayout
    counters={ counters }
    stackWebentities = { stackWebentities[selectedStack] || [] }
    selectedStack={ selectedStack }
    stackFilter={ stackFilter }
    loadingStack={ loadingStack }
    loadingWebentity= { loadingWebentity }
    loadingBatchActions = { loadingBatchActions }
    tabWebentity={ tabWebentity }
    onSelectWebentity={ handleSelectWebentity }
    // onDownloadList={ handleDownloadList }
    onSetTabUrl={ handleSetTabUrl }
    onSelectStack= { handleFetchStack }
    onOpenTab={ handleOpenTab }
    onBatchActions = { handleBatchActions } />)
}


StackListContainer.propTypes = {
  activeTab: PropTypes.object.isRequired,
  webentities: PropTypes.object.isRequired,
  tlds: PropTypes.object,
  corpusId: PropTypes.string,
  serverUrl: PropTypes.string,

  // actions
  openTab: PropTypes.func,
  setTabUrl: PropTypes.func,
}

const mapStateToProps = ({ corpora, servers, stacks, webentities, tabs, ui: { loaders } }) => ({
  status: corpora.status,
  corpusId: corpora.selected.corpus_id,
  activeTab: tabs.activeTab,
  webentities,
  selectedStack: stacks.selected,
  stackFilter: stacks.filter,
  stackWebentities: stacks.webentities,
  tlds: webentities.tlds,
  loadingStack: stacks.loading,
  loadingWebentity: stacks.loadingWebentity,
  loadingBatchActions: loaders.webentity_batch_actions,
  serverUrl: servers.selected.url
})


export default connect(mapStateToProps, {
  openTab,
  setTabUrl,
  viewWebentity,
  fetchStack,
  batchWebentityActions,
  addTag,
  updateTag,
  removeTag
})(StackListContainer)
