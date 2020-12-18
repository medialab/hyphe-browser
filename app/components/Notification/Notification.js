import './notification.styl'
import 'animate.css'

import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'
import { hideNotif } from '../../actions/browser'

const Notification = ( {
  messageId,
  messageValues,
  type = 'error',
  hideNotif
} ) => {
  if (!messageId) {
    return null
  }

  const message = <T id={ messageId } values={ messageValues || {} } />

  return (
    <div className="notification-container">
      <div className={ `animated bounceInDown notification notification-${type}` }>
        <strong>{ message }</strong>
        <a className="error-dialog-close" onClick={ hideNotif }>
          <i className="ti-close" />
        </a>
      </div>
    </div>
  )
}

Notification.propTypes = {
  messageId: PropTypes.string,
  messageValues: PropTypes.object,
  type: PropTypes.oneOf(['', 'notice', 'warning', 'error']),

  // actions
  hideNotif: PropTypes.func.isRequired
}

const mapStateToProps = ({ ui }) => (ui.notification)

export default connect(mapStateToProps, { hideNotif })(Notification)
