import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { debounce } from 'lodash'

import jsonrpc from '../../utils/jsonrpc'
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
  const visitedWebentities = Object.keys(webentities.webentities)

  const [stacksViewedPage, setStacksViewedPage] = useState({})

  const [searchString, setSearchString] = useState('')
  const [searchedResult, setSearchedResult] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  // clear search string if switch stack
  useEffect(() => {
    setSearchString('')
  }, [selectedStack])

  // Auto fetch next page for "DISCOVERED" list if current entity reaches last 3 items
  useEffect(() => {
    if (tabWebentity && selectedStack === 'DISCOVERED') {
      const idx = webentitiesList.findIndex(x => x.id === tabWebentity.id)
      const { token, next_page } = stackWebentities[selectedStack]
      if (idx >= webentitiesList.length - 3 && token && next_page) {
        fetchStackPage({ serverUrl, corpusId, stack: selectedStack, token, page: next_page })
      }
    }
  }, [tabWebentity && tabWebentity.id])

  // auto-paginate stack to its viewedPage when re-fetch stack is triggered
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

  const searchWebentities = (searchString) => {
    setIsSearching(true)
    return jsonrpc(serverUrl)(
      'store.search_webentities',
      {
        allFieldsKeywords: searchString,
        fieldKeywords: [['status', selectedStack]],
        count: 50,
        page: 0,
        light: false,
        semilight: false,
        corpus: corpusId,
      }
    ).then((res) => {
      setSearchedResult(res)
      setIsSearching(false)
    }).catch(() => setIsSearching(false))
  }

  const loadNextSearch = (token, page) => {
    setIsSearching(true)
    return jsonrpc(serverUrl)(
      'store.get_webentities_page',
      {pagination_token: token, n_page: page, idNamesOnly: false, corpus: corpusId}
    ).then((res) => {
      setSearchedResult({
        ...res,
        webentities: searchedResult.webentities.concat(res.webentities)
      })
      setIsSearching(false)
    }).catch(() => setIsSearching(false))
  }

  const debounceSearchWebentities = debounce(searchWebentities, 1000)
  const handleSearch = (searchString, filterTags) => {
    setSearchString(searchString)
    if (searchString.length && !filterTags) {
      debounceSearchWebentities(searchString)
    } else {
      setSearchedResult(null)
    }
  }

  const handleLoadNextPage = () => {
    if (searchString.length) {
      const { token, next_page } = searchedResult
      loadNextSearch(token, next_page)
    } else {
      const { token, next_page } = stackWebentities[selectedStack]
      // record paginated page for each stack
      setStacksViewedPage({ [selectedStack]: next_page })
      fetchStackPage({ serverUrl, corpusId, stack: selectedStack, token, page: next_page })
    }
  }

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

  const counters = status.corpus.traph.webentities

  if (!selectedStack) return null
  return (
    <StackListLayout
      counters={ counters }
      searchString={ searchString }
      searchedResult={ searchedResult }
      isSearching={ isSearching }
      stackWebentities = { stackWebentities }
      visitedWebentities={ visitedWebentities }
      selectedStack={ selectedStack }
      loadingStack={ loadingStack }
      loadingWebentity= { loadingWebentity }
      loadingBatchActions = { loadingBatchActions }
      tabWebentity={ tabWebentity }
      onSelectWebentity={ handleSelectWebentity }
      onDownloadList={ handleDownloadList }
      onSetTabUrl={ handleSetTabUrl }
      onSelectStack= { handleSelectStack }
      onOpenTab={ handleOpenTab }
      onUpdateSearch={ handleSearch }
      onLoadNextPage={ handleLoadNextPage }
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

