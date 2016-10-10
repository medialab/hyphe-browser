// lists of links at the bottom of the sidebar

import '../../../css/browser/side-bar-contextual-lists'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import {
  fetchMostLinked,
  fetchParents,
  fetchSubs,
  selectContextualList
} from '../../../actions/contextual-lists'

class _List extends React.Component {
  render () {
    const { formatMessage } = this.context.intl
    const { links } = this.props
    return (
      <div className="browser-side-bar-contextual-list">
        <ul>
          { links.map(link =>
            <li key={ link.url }>
              <div className="link-name">
                { formatMessage({ id: 'linked' }) }
                <span className="link-linked">{ link.linked }</span>
                { formatMessage({ id: 'times' }) }
              </div>
              <div className="link-url">{ link.url }</div>
            </li>
          ) }
        </ul>
      </div>
    )
  }
}

_List.contextTypes = {
  intl: intlShape
}

_List.propTypes = {
  links: PropTypes.array
}

const List = connect(({ intl: { locale } }) => ({ locale }))(_List)


class SideBarContextualLists extends React.Component {
  componentDidMount () {
    this.updateCurrentList()
  }

  componentWillReceiveProps (props) {
    // change in nav
    if (props.selected !== this.props.selected)
      this.updateCurrentList(props.selected)
    // change of list content
    if (JSON.stringify(props[props.selected]) !== JSON.stringify(this.props[props.selected]))
      this.updateCurrentList(props.selected)
  }

  updateCurrentList (selected) {
    const { serverUrl, corpusId, webentity,
      fetchMostLinked, fetchParents, fetchSubs } = this.props

    // TODO DRY
    switch (selected) {
    case 'mostLinked':
      fetchMostLinked(serverUrl, corpusId, webentity.id)
      break

    case 'parents':
      fetchParents(serverUrl, corpusId, webentity.id)
      break

    case 'subs':
      fetchSubs(serverUrl, corpusId, webentity.id)
      break
    }
  }

  render () {
    const { selectContextualList, selected } = this.props

    return (
      <div className="browser-side-bar-contextual-lists">
        <nav>
          { ['mostLinked', 'parents', 'subs'].map(l =>
            <button className={ cx('btn', 'btn-default', { selected: l === selected }) }
              key={ l } onClick={ () => selectContextualList(l) }>
              <T id={ `sidebar.contextual.${l}` } />
            </button>
          ) }
          <List links={ this.props[selected] } />
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

  mostLinked: PropTypes.array,
  parents: PropTypes.array,
  subs: PropTypes.array,
  selected: PropTypes.string,

  fetchMostLinked: PropTypes.func,
  fetchParents: PropTypes.func,
  fetchSubs: PropTypes.func,
  selectContextualList: PropTypes.func
}

const mapStateToProps = ({ contextualLists, intl: { locale } }) => ({
  mostLinked: contextualLists.mostLinked,
  parents: contextualLists.parents,
  subs: contextualLists.subs,
  selected: contextualLists.selected,
  locale
})

export default connect(mapStateToProps, {
  fetchMostLinked,
  fetchParents,
  fetchSubs,
  selectContextualList
})(SideBarContextualLists)
