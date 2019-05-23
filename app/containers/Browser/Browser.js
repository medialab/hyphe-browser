import './browser.styl'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer as ipc } from 'electron'

import Header from '../../components/Header'
import Spinner from '../../components/Spinner'
import Notification from '../../components/Notification'
import BrowserStack from '../BrowserStack'
import BrowserTabs from '../BrowserTabs'
import CorpusStatusWatcher from './CorpusStatusWatcher'

import { fieldParser, flatTag, downloadFile } from '../../utils/file-downloader'
import jsonrpc from '../../utils/jsonrpc'

class Browser extends React.Component {
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
      (we) => we.tags ? fieldParser(we, tlds) : we
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
    const { corpus, status } = this.props
    if (!corpus) {
      // Corpus not yet selected
      return <Spinner />
    }

    return (
      <CorpusStatusWatcher className="window browser-window">
        <Header corpus={ corpus } status={ status } />
        <BrowserStack />
        <BrowserTabs />
        <Notification />
      </CorpusStatusWatcher>
    )
  }
}
Browser.propTypes = {
  corpus: PropTypes.object,
  status: PropTypes.object,
  stacks: PropTypes.array,
  serverUrl: PropTypes.string,
  tlds: PropTypes.object,
  locale: PropTypes.string.isRequired,
}

const mapStateToProps = ({ corpora, servers, webentities, intl: { locale }, stacks }) => ({
  corpus: corpora.selected,
  status: corpora.status,
  stacks: stacks.list,
  tlds: webentities.tlds,
  serverUrl: servers.selected.url,

  // hack needed to propagate locale change
  locale
})

export default connect(mapStateToProps)(Browser)
