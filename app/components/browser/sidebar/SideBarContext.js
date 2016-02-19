import '../../../css/browser/side-bar'

import React, { PropTypes } from 'react'
import { webentityShape } from '../../../types'

import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'
import cx from 'classnames'


class SideBarContext extends React.Component {
  render () {
    return <strong><T id="sidebar.context-title" /></strong>
  }
}


SideBarContext.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: webentityShape
}

const mapStateToProps = ({ ui }) => ({ // eslint-disable-line
})

export default connect(mapStateToProps, {
})(SideBarContext)
