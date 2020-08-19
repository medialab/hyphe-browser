import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  batchWebentityActions,
  setTabWebentity
} from '../../actions/webentities'

import { viewWebentity, selectStack, fetchStack, fetchStackPage } from '../../actions/stacks'

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
  setAsideMode, // props action
  setTabWebentity,
  fetchStack,
  fetchStackPage,
  setTabUrl,
  openTab,
  viewWebentity,
  batchWebentityActions,
}) => {
  const tabWebentity = webentities && webentities.webentities[webentities.tabs[activeTab.id]]
  const webentitiesList = selectedStack && stackWebentities[selectedStack] ? stackWebentities[selectedStack].webentities : []
  const [stacksViewedPage, setStacksViewedPage] = useState({})

  useEffect(() => {
    if (tabWebentity && selectedStack === 'DISCOVERED') {
      const idx = webentitiesList.findIndex(x => x.id === tabWebentity.id)
      // Auto fetch next page for "DISCOVERED" list if current entity reaches last 3 items
      const { token, next_page } = stackWebentities[selectedStack]
      if (idx >= webentitiesList.length - 3 && token && next_page) {
        fetchStackPage({ serverUrl, corpusId, stack: selectedStack, token, page: next_page })
      }
    }
  }, [tabWebentity && tabWebentity.id])

  // auto-paginate stack to viewedPage when switch to different stack
  useEffect(() => {
    if (stackWebentities[selectedStack] &&
        stacksViewedPage[selectedStack] &&
        stackWebentities[selectedStack].next_page &&
        stackWebentities[selectedStack].page < stacksViewedPage[selectedStack]) {
      fetchStackPage({
        serverUrl,
        corpusId,
        stack: selectedStack,
        token: stackWebentities[selectedStack].token,
        page: stackWebentities[selectedStack].next_page
      })
    }
  }, [selectedStack, selectedStack && stackWebentities[selectedStack] && stackWebentities[selectedStack].page])

  const handleSelectWebentity = (webentity) => {
    viewWebentity(webentity)
    setTabUrl({ url: webentity.homepage, id: activeTab.id })
    setTabWebentity({ tabId: activeTab.id, webentity })
    setAsideMode('webentityBrowse')
  }

  const handleDownloadList = (list) => {
    const fileName = `${corpusId}_${selectedStack}`
    const parsedWebentity = list.map((we) => {
      if (we.tags) {
        return fieldParser(we, tlds, 'csv')
      } else {
        return we
      }
    })

    const flatList = flatTag(parsedWebentity)
    downloadFile(flatList, fileName, 'csv')
  }

  const handleSelectStack = (stack, filter) => {
    // TO BE DISCUSS: at which point should re-fetch the stack list?
    fetchStack({ serverUrl, corpusId, stack, filter })
  }

  const handleSetTabUrl = (url) => setTabUrl({ url, id: activeTab.id })
  const handleOpenTab = (url) => openTab({ url, activeTabId: activeTab.id })
  const handleBatchActions = (actions, selectedList) => batchWebentityActions({ actions, serverUrl, corpusId, selectedList })

  const handleFetchStackPage = (stack, token, page) => {
    // record paginated page for each stack
    setStacksViewedPage({ [stack]: page })
    fetchStackPage({ serverUrl, corpusId, stack, token, page })
  }
  const counters = status.corpus.traph.webentities

  if (!selectedStack) return null
  return (
    <StackListLayout
      counters={ counters }
      stackWebentities = { stackWebentities }
      selectedStack={ selectedStack }
      stackFilter={ stackFilter }
      loadingStack={ loadingStack }
      loadingWebentity= { loadingWebentity }
      loadingBatchActions = { loadingBatchActions }
      tabWebentity={ tabWebentity }
      onSelectWebentity={ handleSelectWebentity }
      onDownloadList={ handleDownloadList }
      onSetTabUrl={ handleSetTabUrl }
      onSelectStack= { handleSelectStack }
      onLoadNextPage={ handleFetchStackPage }
      onOpenTab={ handleOpenTab }
      onBatchActions = { handleBatchActions }
    />
  )
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
  selectStack,
  fetchStack,
  fetchStackPage,
  batchWebentityActions,
  addTag,
  updateTag,
  removeTag,
  setTabWebentity,
})(StackListContainer)

