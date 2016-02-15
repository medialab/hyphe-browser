import '../../../css/browser/side-bar'

import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'
import cx from 'classnames'


class SideBarTags extends React.Component {
  render () {
    return <strong><T id="sidebar.tags-title" /></strong>
  }
}


SideBarTags.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object.isRequired
}

const mapStateToProps = ({ ui }) => ({ // eslint-disable-line
})

export default connect(mapStateToProps, {
})(SideBarTags)
