// lists of links at the bottom of the sidebar

import '../../../css/browser/side-bar-contextual-lists'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import { setTabUrl, openTab } from '../../../actions/tabs'
import {
  fetchMostLinked,
  fetchReferrers,
  fetchReferrals,
  fetchParents,
  fetchChildren
} from '../../../actions/webentities'
import { selectContextualList } from '../../../actions/browser'
import { compareUrls } from '../../../utils/lru'
import { fieldParser, downloadCSV } from '../../../utils/file-downloader'


class _List extends React.Component {
  onClick (url) {
    const { activeTabId, name, setTabUrl, openTab } = this.props
    if (name === 'mostLinked') {
      setTabUrl(url, activeTabId)
    } else {
      openTab(url)
    }
  }

  render () {
    const { formatMessage } = this.context.intl
    const { name, links, activeTabUrl } = this.props

    return (
      <div className="browser-side-bar-contextual-list">
        <ul>
          { links.length ? links.map(link =>
            ( name === 'mostLinked' ?
              <li key={ link.url } title={ link.url }>
                { !compareUrls(link.url, activeTabUrl) ?
                  <div className="link-url" onClick={ () => this.onClick(link.url) }>{ link.url }</div> :
                  <div className="link-url inactive" >{ link.url }</div>
                }
                { link.linked ? <div className="link-linked">
                  { formatMessage({ id: 'linked' }) }
                  <T className="link-linked" id="linkedtimes" values={ { count: link.linked } } />
                </div> :
                <br/> }
              </li> :
              <li key={ link.id } title={ link.name + "\n" + link.homepage }>
                <div className="link-name" onClick={ () => this.onClick(link.homepage) }>{ link.name }</div>
                <div className="link-url" onClick={ () => this.onClick(link.homepage) }>{ link.homepage }</div>
              </li>
            )
          ) : formatMessage({ id: 'none' }) }
        </ul>
      </div>
    )
  }
}

_List.contextTypes = {
  intl: intlShape
}

_List.propTypes = {
  activeTabId: PropTypes.string,
  activeTabUrl: PropTypes.string,
  links: PropTypes.array,
  name: PropTypes.string,

  setTabUrl: PropTypes.func,
  openTab: PropTypes.func
}

const _mapStateToProps = ({ tabs, intl: { locale } }) => ({
  activeTabId: tabs.activeTab && tabs.activeTab.id,
  activeTabUrl: (tabs.activeTab ? tabs.activeTab.url : ''),
  locale
})

const List = connect(_mapStateToProps, {
  setTabUrl,
  openTab,
})(_List)


class SideBarContextualLists extends React.Component {

  updateCurrentList (selected) {
    const { serverUrl, corpusId, webentity, selectContextualList,
      fetchMostLinked, fetchReferrers, fetchReferrals, fetchParents, fetchChildren } = this.props
    selectContextualList(selected)

    switch (selected) {
    case 'referrers':
      fetchReferrers(serverUrl, corpusId, webentity)
      break
    case 'referrals':
      fetchReferrals(serverUrl, corpusId, webentity)
      break
    case 'parents':
      fetchParents(serverUrl, corpusId, webentity)
      break
    case 'children':
      fetchChildren(serverUrl, corpusId, webentity)
      break
    default:
      fetchMostLinked(serverUrl, corpusId, webentity)
      break
    }
  }

  downloadFile () {
    const { corpusId, webentity, selected, tlds } = this.props
    let listName, fileName
    switch (selected) {
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
      listName = selected
      break
    }
    fileName = webentity.name.replace(/[\s\/]/g, '_')
    const parsedWebentity = webentity[selected].map((we) => fieldParser(we, tlds))
    const flatList = parsedWebentity.map( (el) => {
      let WE = Object.assign({}, el)
      const fields = ['TECHNICAL INFO', 'TAGS']
      fields.forEach((field) => {
        if (el[field]) {
          Object.keys(el[field]).forEach(tag => {
            WE[`${tag} (${field})`] = el[field][tag]
          })
          delete(WE[field])
        }
      })
      delete(WE._id)
      return WE
    })
    downloadCSV(flatList, listName, fileName, corpusId)
  }

  render () {
    const { selectContextualList, selected, webentity } = this.props
    return (
      <div className="browser-side-bar-contextual-lists">
        <nav>
          {
            // hide parents and children tabs for now
            ['mostLinked', 'referrers', 'referrals'].map(l =>
            <button className={ cx('btn', 'btn-default', 'navigation', { selected: l === selected }) }
              key={ l } onClick={ () => this.updateCurrentList(l) }>
              <T id={ `sidebar.contextual.${l}` } />
            </button>
          ) }
          { !webentity[selected]
            ? <T id="loading" />
            : <List links={ webentity[selected] } name={ selected } />
          }
          { webentity[selected] && webentity[selected].length > 0 &&
            <div className="download">
              <button className='btn btn-default' onClick={ () => {this.downloadFile()} }>
                <strong>
                  <T id="sidebar.contextual.downloadToCSV" />
                  <span>&nbsp;</span>
                  <span className="ti-download"></span>
                </strong>
              </button>
            </div>
          }
        </nav>
      </div>
    )
  }
}

SideBarContextualLists.contextTypes = {
  intl: intlShape
}

SideBarContextualLists.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object.isRequired,

  selected: PropTypes.string,
  tlds: PropTypes.object.isRequired,

  fetchMostLinked: PropTypes.func,
  fetchReferrers: PropTypes.func,
  fetchReferrals: PropTypes.func,
  fetchParents: PropTypes.func,
  fetchChildren: PropTypes.func,
  selectContextualList: PropTypes.func
}

const mapStateToProps = ({ ui, webentities, intl: { locale } }, props) => ({
  selected: ui.selectedContext,
  tlds: webentities.tlds,
  locale
})

export default connect(mapStateToProps, {
  fetchMostLinked,
  fetchReferrers,
  fetchReferrals,
  fetchParents,
  fetchChildren,
  selectContextualList,
})(SideBarContextualLists)

