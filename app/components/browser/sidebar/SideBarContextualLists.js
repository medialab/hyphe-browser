// lists of links at the bottom of the sidebar

import '../../../css/browser/side-bar'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import { fetchMostLinked } from '../../../actions/contextual-lists'

class List extends React.Component {
  render () {
    const { links } = this.props
    return (
      <ul className="browser-side-bar-contextual-list">
        { links.map(link => <li key={ link.url }>{ link.url }</li>) }
      </ul>
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
      <List links={ mostLinked } />
    )
  }
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
