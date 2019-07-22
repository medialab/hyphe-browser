import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer as ipc } from 'electron'

import Spinner from '../../components/Spinner'
import CorpusStatusWatcher from './CorpusStatusWatcher'
import BrowserLayout from './BrowserLayout'
import { fieldParser, flatTag, downloadFile } from '../../utils/file-downloader'
import jsonrpc from '../../utils/jsonrpc'
import { openTab } from '../../actions/tabs'  
import { fetchStackAndSetTab } from '../../actions/stacks'

import {
  PAGE_HYPHE_HOME } from '../../constants'

class BroswerContainer extends React.Component {
  componentDidMount () {
    ipc.send('corpusReady')
    this.ipcExportFile = (e, type, fileFormat) => {
      if(type !== 'tags') {
        this.exportWebentity(type, fileFormat)
      }
      else {
        this.exportTags(fileFormat)
      }
    }
    ipc.on('exportFile', this.ipcExportFile)
  }

  componentWillUnmount () {
    ipc.send('corpusClosed')
  }

  downloadWebentities = (list, listName, fileFormat) => {
    if (list.length === 0) return
    const { tlds, corpus } = this.props
    const corpusId = corpus.corpus_id
    const parsedWebentity = list.map(
      (we) => we.tags ? fieldParser(we, tlds, fileFormat) : we
    )
    const fileName = `${corpusId}_${listName}`
    if (fileFormat === 'csv') {
      const flatList = flatTag(parsedWebentity)
      downloadFile(flatList, fileName, fileFormat)
    } else {
      downloadFile(list, fileName, fileFormat)
    }
  }

  exportWebentity = (status, fileFormat) => {
    const { corpus, serverUrl, stacks } = this.props
    let stacksExport
    switch(status) {
    case 'IN':
      stacksExport = stacks.find((s) => s.name === status)
      jsonrpc(serverUrl)(stacksExport.method, stacksExport.args.concat(corpus.corpus_id))
        .then((webentities) => this.downloadWebentities(webentities, status, fileFormat))
      break
    case 'IN_UNDECIDED':
      stacksExport = stacks.filter((s) => s.name === 'IN' || s.name === 'UNDECIDED')
      Promise.all(stacksExport.map((stack) => jsonrpc(serverUrl)(stack.method, stack.args.concat(corpus.corpus_id))))
        .then((list) => {
          const webentities = list[0].concat(list[1])
          this.downloadWebentities(webentities, status, fileFormat)
        })
      break
    default: break
    }
  }
  
  exportTags = (fileFormat) => {
    const { corpus, serverUrl } = this.props
    const corpusId = corpus.corpus_id
    const fileName = `${corpusId}_tags`
    jsonrpc(serverUrl)('store.get_tags', ['USER', corpusId])
      .then((tags) => downloadFile(tags, fileName, fileFormat))
  }

  render () {
    const { stacks, corpus, status, serverUrl, instanceUrl, activeTab, openTab, fetchStackAndSetTab } = this.props
    
    const handleFetchStackAndSetTab = (stackName) => {
      const selectedStack = stacks.find((stack) => stack.name === stackName)
      fetchStackAndSetTab(serverUrl, corpus.corpus_id, selectedStack, activeTab.id)
    }
    
    if (!corpus) {
      // Corpus not yet selected
      return <Spinner />
    }
    
    const { total_webentities } = corpus
    return (
      <CorpusStatusWatcher>
        {corpus && 
        <BrowserLayout 
          corpus={ corpus }
          status={ status }
          stacks = { stacks }
          isEmpty={ total_webentities === 0 }
          isLanding = { activeTab.url === PAGE_HYPHE_HOME }
          instanceUrl={ instanceUrl }
          onSelectStack = { handleFetchStackAndSetTab }
          openTab={ openTab } />
        }
      </CorpusStatusWatcher>
    )
  }
}

BroswerContainer.propTypes = {
  corpus: PropTypes.object,
  status: PropTypes.object,
  stacks: PropTypes.array,
  serverUrl: PropTypes.string,
  instanceUrl: PropTypes.string,
  tlds: PropTypes.object,
  locale: PropTypes.string.isRequired,
  // actions
  openTab: PropTypes.func
}

const mapStateToProps = ({ corpora, servers, webentities, tabs, intl: { locale }, stacks, ui }) => ({
  corpus: corpora.selected,
  status: corpora.status,
  stacks: stacks.list,
  tlds: webentities.tlds,
  activeTab: tabs.activeTab,
  serverUrl: servers.selected.url,
  instanceUrl: servers.selected.home,

  // hack needed to propagate locale change
  locale
})

export default connect(mapStateToProps, { 
  fetchStackAndSetTab,
  openTab
})(BroswerContainer)
