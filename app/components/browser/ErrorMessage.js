import React, { PropTypes } from 'react'

class ErrorMessage extends React.Component {
  render () {
    const { message, icon, fatal } = this.props

    return (
      <div className={ 'error-dialog-wrapper ' + (fatal ? 'blocking' : '') }>
        <div className={ 'error-dialog ' + (message ? 'visible' : 'hidden') }>
          { icon ? <span className={ 'icon icon-' + icon } /> : null }
          <strong> { message }</strong>
        </div>
      </div>
    )
  }
}

ErrorMessage.propTypes = {
  message: PropTypes.string,
  fatal: PropTypes.bool,
  icon: PropTypes.string
}

export default ErrorMessage
