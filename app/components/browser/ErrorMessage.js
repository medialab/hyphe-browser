import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'
import { hideError } from '../../actions/browser'

class ErrorMessage extends React.Component {
  render () {
    const { messageId, messageValues, icon, fatal, hideError } = this.props

    const message = messageId
      ? <T id={ messageId } values={ messageValues || {} } />
      : ''

    return (
      <div className={ 'error-dialog-wrapper ' + (fatal ? 'blocking' : '') }>
        <div className={ 'error-dialog ' + (messageId ? 'visible' : 'hidden') }>
          <a className="error-dialog-close" onClick={ () => hideError() }><span className="icon icon-cancel-circled" /></a>
          { icon ? <span className={ 'icon icon-' + icon } /> : null }
          <strong> { message }</strong>
        </div>
      </div>
    )
  }
}

ErrorMessage.propTypes = {
  messageId: PropTypes.string,
  messageValues: PropTypes.object,
  fatal: PropTypes.bool,
  icon: PropTypes.string,

  hideError: PropTypes.func.isRequired
}

const mapStateToProps = ({ ui }) => {
  return ui.error
}

export default connect(mapStateToProps, { hideError })(ErrorMessage)
