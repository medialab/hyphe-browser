import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { debounce } from 'lodash'

import Spinner from '../../components/Spinner'

import {
  setWebentityName,
  setWebentityHomepage,
  showAdjustWebentity,
  cancelWebentityCrawls,
  batchWebentityActions,
  setTabWebentity,
  setWebentityStatus,
  fetchPaginatePages,
  fetchReferrals,
  fetchReferrers,
  declarePage
} from '../../actions/webentities'

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
  navigationHistory,
  loadingStack,
  loadingWebentity,
  loadingBatchActions,
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
  viewWebentity,
  batchWebentityActions,
  setWebentityHomepage,
  fetchPaginatePages,
  fetchReferrals,
  fetchReferrers,
  addTag,
  updateTag,
  removeTag,
  setTabWebentity,
}) => {
  const webentity = webentities && webentities.webentities[webentities.tabs[activeTab.id]]
  const selectedWebentity = webentities && webentities.selected
  const [initialStatus, setInitialStatus] = useState(webentity && webentity.status)

  const debounceFetchPaginatePages = debounce(fetchPaginatePages, 1000)

  // storing viewed suggestions in an efficient way
  let viewedSuggestionIds = Object.keys(webentities.webentities)
    .map((id)=> webentities.webentities[id])
    .filter((e) => e.status === 'DISCOVERED')
    .map(e => e.id)
  viewedSuggestionIds = new Set(viewedSuggestionIds)

  useEffect(() => {
    if (webentity) {
      setInitialStatus(webentity.status)
    }
    // Fetch paginatePages, referrals and refferes of webentity only once
    if (webentity && !webentity.referrals) {
      fetchReferrals({ serverUrl, corpusId, webentity })
    }
    if (webentity && !webentity.referrers) {
      fetchReferrers({ serverUrl, corpusId, webentity })
    }
    if (webentity && !webentity.paginatePages) {
      fetchPaginatePages({ serverUrl, corpusId, webentity })
    }
  }, [webentity && webentity.id])

  useEffect(() => {
    // Fetch paginatePages if token
    // TODO: crawling the declared page should refetch the paginate pages, currently not
    if (webentity && webentity.token) {
      debounceFetchPaginatePages({ serverUrl, corpusId, webentity, token: webentity.token })
    }
  }, [webentity && webentity.paginatePages && webentity.paginatePages.length])


  const webentitiesList = selectedStack && stackWebentities[selectedStack] ? stackWebentities[selectedStack].webentities : []

  const handleSelectWebentity = (webentity) => {
    viewWebentity(webentity)
    setTabWebentity({ tabId: activeTab.id, webentity })
    setTabUrl({ url: webentity.homepage,id: activeTab.id })
  }

  const handleDownloadList = (list) => {
    let listName
    switch (list) {
    case 'paginatePages':
      listName = 'knownPages'
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

  const handleSetWebentityName = (name) => setWebentityName({ serverUrl, corpusId, name, webentityId: webentity.id })
  const handleSetWebentityHomepage = (url) => setWebentityHomepage({ serverUrl, corpusId, homepage: url, webentityId: webentity.id })

  const handleSetWenentityStatus = (status, we = webentity) => {
    const crawling = !!~['PENDING', 'RUNNING'].indexOf(getWebEntityActivityStatus(we))

    if (status !== 'DISCOVERED' && status === we.status) {
      // Click on current status = set to discovered
      status = 'DISCOVERED'
    }

    if (status === 'IN' && !crawling) {
      // Set to IN = go to "adjust" mode and validation triggers crawling
      showAdjustWebentity({ webentityId: we.id, crawl: true, createNewEntity: false })
    } else {
      setWebentityStatus({ serverUrl, corpusId, status, webentityId: we.id })
    }

    if (status === 'OUT' && crawling) {
      cancelWebentityCrawls({ serverUrl, corpusId, webentityId: we.id })
    }
  }

  const handleSetTabUrl = (url) => setTabUrl({ url, id: activeTab.id })
  const handleOpenTab = (url) => openTab({ url, activeTabId: activeTab.id })
  const handleBatchActions = (actions, selectedList) => {
    batchWebentityActions({ actions, serverUrl, corpusId, webentity, selectedList })
    .then(() => {
      if (actions[0].type === 'MERGE') {
        selectedList === 'referrals' ? fetchReferrals({ serverUrl, corpusId, webentity }) : fetchReferrers({ serverUrl, corpusId, webentity })
      }
    })
  }

  const handleAddTag = (category, value) => addTag(serverUrl, corpusId, category, webentity.id, value)
  const handleUpdateTag = (category, oldValue, newValue) => updateTag(serverUrl, corpusId, category, webentity.id, oldValue, newValue)
  const handleRemoveTag = (category, value) => removeTag(serverUrl, corpusId, category, webentity.id, value)
  const filteredCategories = React.useMemo(() => categories.filter(cat => cat !== 'FREETAGS'), [categories])

  const handleFetchLinkedEntities = (selected) => {
    selected === 'referrals' ? fetchReferrals({ serverUrl, corpusId, webentity }) : fetchReferrers({ serverUrl, corpusId, webentity })
  }

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
  if (!webentity || !webentity.id) {
    return <div className="loader-container"><Spinner /></div>
  }
  return (
    <WebentityBrowseLayout
      webentity={ webentity }
      tlds={ tlds }
      viewedSuggestionIds={ viewedSuggestionIds }
      navigationHistory={ navigationHistory }
      stackWebentities={ stackWebentities }
      initialStatus={ initialStatus }
      webentitiesList= { webentitiesList }
      selectedStack={ selectedStack }
      selectedWebentity = { selectedWebentity }
      loadingStack={ loadingStack }
      loadingWebentity= { loadingWebentity }
      loadingBatchActions = { loadingBatchActions }
      tabUrl={ activeTab.url }
      categories={ filteredCategories }
      tagsSuggestions={ tagsSuggestions || empty }
      onFetchLinkedEntities={ handleFetchLinkedEntities }
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
  setWebentityHomepage: PropTypes.func,
  fetchReferrers: PropTypes.func.isRequired,
  fetchReferrals: PropTypes.func.isRequired,
  fetchPaginatePages: PropTypes.func.isRequired
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
  navigationHistory: corpora.navigationHistory[corpora.selected.corpus_id] || [],
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
  setTabWebentity,
  fetchReferrals,
  fetchReferrers,
  fetchPaginatePages
})(React.memo(WebentityBrowseContainer))
