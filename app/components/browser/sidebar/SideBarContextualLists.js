// lists of links at the bottom of the sidebar

import '../../../css/browser/side-bar-contextual-lists'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import { setTabUrl, openTab } from '../../../actions/tabs'
import {
  fetchMostLinked,
  fetchParents,
  fetchChildren
} from '../../../actions/webentities'
import { selectContextualList } from '../../../actions/browser'
import { compareUrls } from '../../../utils/lru'

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
      fetchMostLinked, fetchParents, fetchChildren } = this.props
    selectContextualList(selected)

    switch (selected) {
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

  render () {
    const { selectContextualList, selected, webentity } = this.props

    return (
      <div className="browser-side-bar-contextual-lists">
        <nav>
          { ['mostLinked', 'parents', 'children'].map(l =>
            <button className={ cx('btn', 'btn-default', { selected: l === selected }) }
              key={ l } onClick={ () => this.updateCurrentList(l) }>
              <T id={ `sidebar.contextual.${l}` } />
            </button>
          ) }
          { !webentity[selected]
            ? <T id="loading" />
            : <List links={ webentity[selected] } name={ selected } />
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

  fetchMostLinked: PropTypes.func,
  fetchParents: PropTypes.func,
  fetchChildren: PropTypes.func,
  selectContextualList: PropTypes.func
}

const mapStateToProps = ({ ui, intl: { locale } }, props) => ({
  selected: ui.selectedContext,
  locale
})

export default connect(mapStateToProps, {
  fetchMostLinked,
  fetchParents,
  fetchChildren,
  selectContextualList,
})(SideBarContextualLists)
