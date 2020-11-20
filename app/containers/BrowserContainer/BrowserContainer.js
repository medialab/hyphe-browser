import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer as ipc } from 'electron'

import Spinner from '../../components/Spinner'
import CorpusStatusWatcher from './CorpusStatusWatcher'
import Notification from '../../components/Notification'

import BrowserLayout from './BrowserLayout'
import { fieldParser, flatTag, downloadFile } from '../../utils/file-downloader'
import jsonrpc from '../../utils/jsonrpc'
import { openTab } from '../../actions/tabs'

import {
  STACKS_LIST,
  PAGE_HYPHE_HOME } from '../../constants'

class BrowserContainer extends React.Component {
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
    ipc.removeListener('exportFile', this.ipcExportFile)
  }

  downloadWebentities = (list, listName, fileFormat) => {
    if (list.length === 0) return
    const { tlds, corpus } = this.props
    const corpusId = corpus.corpus_id
    const parsedWebentity = list.map((we) => {
      if (we.tags) {
        return fieldParser(we, tlds, fileFormat)
      } else {
        return we
      }
    })
    const fileName = `${corpusId}_${listName}`
    if (fileFormat === 'csv') {
      const flatList = flatTag(parsedWebentity)
      downloadFile(flatList, fileName, fileFormat)
    } else {
      downloadFile(list, fileName, fileFormat)
    }
  }

  exportWebentity = (status, fileFormat) => {
    const { corpus, serverUrl } = this.props
    let stacksExport
    switch(status) {
    case 'IN':
      stacksExport = STACKS_LIST.find((s) => s.name === status)
      jsonrpc(serverUrl)(stacksExport.method, stacksExport.args.concat(corpus.corpus_id))
        .then((webentities) => this.downloadWebentities(webentities, status, fileFormat))
      break
    case 'IN_UNDECIDED':
      stacksExport = STACKS_LIST.filter((s) => s.name === 'IN' || s.name === 'UNDECIDED')
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
      .then((tags) => {
        if (fileFormat === 'csv') {
          const flatTags = []
          Object.keys(tags).forEach((cat) => {
            Object.keys(tags[cat]).forEach((val) => {
              flatTags.push({
                "CATEGORY": cat,
                "VALUE": val,
                "COUNT": tags[cat][val]
              })
            })
          })
          downloadFile(flatTags, fileName, fileFormat)
        } else {
          downloadFile(tags, fileName, fileFormat)
        }
      })
  }

  render () {
    const {
      selectedStack,
      corpus,
      status,
      instanceUrl,
      activeTab,
      openTab,
      webentities,
    } = this.props


    if (!corpus) {
      // Corpus not yet selected
      return <Spinner />
    }
    const webentity = webentities && webentities.webentities[webentities.tabs[activeTab.id]]
    return (
      <CorpusStatusWatcher>
        {corpus &&
        <BrowserLayout
          corpus={ corpus }
          status={ status }
          webentity={ webentity }
          selectedStack={ selectedStack }
          isLanding = { activeTab.url === PAGE_HYPHE_HOME }
          instanceUrl={ instanceUrl }
          openTab={ openTab }
        />
        }
        <Notification />
      </CorpusStatusWatcher>
    )
  }
}

BrowserContainer.propTypes = {
  corpus: PropTypes.object,
  status: PropTypes.object,
  serverUrl: PropTypes.string,
  instanceUrl: PropTypes.string,
  tlds: PropTypes.object,
  locale: PropTypes.string.isRequired,
  // actions
  openTab: PropTypes.func
}

const mapStateToProps = ({ corpora, servers, webentities, tabs, intl: { locale }, stacks }) => ({
  corpus: corpora.selected,
  status: corpora.status,
  selectedStack: stacks.selected,
  webentities,
  tlds: webentities.tlds,
  activeTab: tabs.activeTab,
  serverUrl: servers.selected.url,
  instanceUrl: servers.selected.home,

  // hack needed to propagate locale change
  locale
})

export default connect(mapStateToProps, {
  openTab
})(BrowserContainer)
