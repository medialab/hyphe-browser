// lists of links at the bottom of the sidebar

import '../../../css/browser/side-bar-contextual-lists'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'

import { fetchMostLinked } from '../../../actions/contextual-lists'

class List extends React.Component {
  render () {
    const { links } = this.props
    return (
      <div className="browser-side-bar-contextual-list">
        <ul>
          { links.map(link =>
            <li key={ link.url }>
              <div className="link-name">Name</div>
              <div className="link-url">{ link.url }</div>
            </li>
          ) }
        </ul>
      </div>
    )
  }
}


class SideBarContextualLists extends React.Component {
  componentDidMount () {
    this.updateCurrentList()
  }

  componentWillReceiveProps (props) {
    if (JSON.stringify(props.mostLinked) !== JSON.stringify(this.props.mostLinked))
      this.updateCurrentList()
  }

  updateCurrentList () {
    const { serverUrl, corpusId, webentity, fetchMostLinked } = this.props
    fetchMostLinked(serverUrl, corpusId, webentity.id)
  }

  render () {
    const { mostLinked } = this.props
    if (!mostLinked.length) return <strong>empty!!</strong>

    return (
      <div className="browser-side-bar-contextual-lists">
        <nav>
          <button className="btn btn-default selected"><T id="sidebar.contextual.mostLinked" /></button>
          <button className="btn btn-default"><T id="sidebar.contextual.parents" /></button>
          <button className="btn btn-default"><T id="sidebar.contextual.subs" /></button>
        </nav>
        <List links={ mostLinked } />
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

  fetchMostLinked: PropTypes.func
}

const mapStateToProps = ({ contextualLists }) => ({ // eslint-disable-line
  mostLinked: contextualLists.mostLinked
})

export default connect(mapStateToProps, {
  fetchMostLinked
})(SideBarContextualLists)
