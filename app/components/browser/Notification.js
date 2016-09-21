import '../../css/browser/notification'
import 'animate.css'

import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'
import { hideError } from '../../actions/browser'

class Notification extends React.Component {
  render () {
    const { messageId, messageValues, type = 'error', hideError } = this.props

    if (!messageId) {
      return null
    }

    const message = <T id={ messageId } values={ messageValues || {} } />

    return (
      <div className="notification-container">
        <div className={ `animated bounceInDown notification notification-${type}` }>
          <a className="error-dialog-close" onClick={ () => hideError() }><span className="icon icon-cancel-circled" /></a>
          <strong>{ message }</strong>
        </div>
      </div>
    )
  }
}

Notification.propTypes = {
  messageId: PropTypes.string,
  messageValues: PropTypes.object,
  type: PropTypes.oneOf(['', 'notice', 'warning', 'error']),

  hideError: PropTypes.func.isRequired
}

const mapStateToProps = ({ ui }) => ui.notification

export default connect(mapStateToProps, { hideError })(Notification)
