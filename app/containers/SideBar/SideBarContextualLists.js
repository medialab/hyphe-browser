// lists of links at the bottom of the sidebar

import './side-bar-contextual-lists'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import { setTabUrl, openTab } from '../../actions/tabs'
import {
  fetchMostLinked,
  fetchReferrers,
  fetchReferrals,
  fetchParents,
  fetchChildren,
  setMergeWebentity
} from '../../actions/webentities'
import { selectContextualList } from '../../actions/browser'
import { compareUrls } from '../../utils/lru'
import { fieldParser, flatTag, downloadFile } from '../../utils/file-downloader'


class _List extends React.Component {
  
  render () {
    const { formatMessage } = this.context.intl
    const { name, links, activeTabUrl, activeTabId, webentity, setMergeWebentity, setTabUrl, openTab } = this.props

    return (
      <div className="browser-side-bar-contextual-list">
        <ul>
          { links.length ? links.map(link => {
            const handleMergeLink = (e) => {
              e.stopPropagation()
              if(webentity && webentity.id && link && link.id) {
                setMergeWebentity(activeTabId, link, webentity, name)
              }
            }
            const handleClick = () => {
              
              if (name === 'mostLinked') {
                setTabUrl(link.url, activeTabId)
              } else {
                openTab(link.homepage)
              }
            }
            return ( name === 'mostLinked' ?
              <li key={ link.url } title={ link.url }>
                { !compareUrls(link.url, activeTabUrl) ?
                  <div className="link-url" onClick={ handleClick }>{ link.url }</div> :
                  <div className="link-url inactive" >{ link.url }</div>
                }
                { link.linked ? <div className="link-linked">
                  { formatMessage({ id: 'linked' }) }
                  <T className="link-linked" id="linkedtimes" values={ { count: link.linked } } />
                </div> :
                <br /> }
              </li> :
              <li key={ link.id } title={ link.name + '\n' + link.homepage }>
                <div className="link-name" onClick={ handleClick }>
                  <span>{ link.name }</span>
                  { (name === 'referrers' || name === 'referrals') && 
                    <span className="link-merge" onClick={ handleMergeLink } >merge</span>
                  }
                </div>
                <div className="link-url" onClick={ handleClick }>{ link.homepage }</div>
              </li>
            )}
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
  webentity: PropTypes.object,

  setMergeWebentity: PropTypes.func,
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
  setMergeWebentity
})(_List)


class SideBarContextualLists extends React.Component {

  componentDidMount () {
    const { selected } = this.props
    this.updateCurrentList(selected)
  }

  componentWillReceiveProps ({ selected, webentity }) {
    if ((webentity && this.props.webentity && webentity.id !== this.props.webentity.id) || selected !== this.props.selected) {
      this.updateCurrentList(selected)
    }
  }

  updateCurrentList (selected) {
    const { serverUrl, corpusId, webentity,
      fetchMostLinked, fetchReferrers, fetchReferrals, fetchParents, fetchChildren } = this.props
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

  downloadWebentity = () => {
    const { corpusId, webentity, selected, tlds } = this.props
    let listName
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
    const webentityName = webentity.name.replace(/[\s\/]/g, '_')
    const parsedWebentity = webentity[selected].map(
      (we) => we.tags ? fieldParser(we, tlds) : we
    )

    const flatList = flatTag(parsedWebentity)
    const fileName = `${corpusId}_${webentityName}_${listName}`
    downloadFile(flatList, fileName, 'csv')
  }

  render () {
    const { selectContextualList, selected, webentity } = this.props
    return (
      <div className="browser-side-bar-contextual-lists">
        <nav>
          {
            // hide parents and children tabs for now
            ['mostLinked', 'referrers', 'referrals'].map(l => {
              const handleSelectContextualList = () => selectContextualList(l)
              return (
                <button
                  className={ cx('btn', 'btn-default', 'navigation', { selected: l === selected }) }
                  key={ l } onClick={ handleSelectContextualList }
                >
                  <T id={ `sidebar.contextual.${l}` } />
                </button>
              )
            }
            ) }
          { !webentity[selected]
            ? <T id="loading" />
            : <List links={ webentity[selected] } name={ selected } webentity={ webentity } />
          }
          { webentity[selected] && webentity[selected].length > 0 &&
            <div className="download">
              <button className='btn btn-default' onClick={ this.downloadWebentity }>
                <strong>
                  <T id="sidebar.contextual.downloadToCSV" />
                  <span>&nbsp;</span>
                  <span className="ti-download" />
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
  setMergeWebentity: PropTypes.func,
  selectContextualList: PropTypes.func
}

const mapStateToProps = ({ ui, webentities, intl: { locale } } ) => ({
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
  setMergeWebentity,
  selectContextualList,
})(SideBarContextualLists)

