import React, { PropTypes } from 'react'
import cx from 'classnames'

class Button extends React.Component {
  render () {
    const { icon, onClick, disabled = false, title, className = '' } = this.props
    const classes = className + (!~className.indexOf("hint--") && title ? " hint--left" : "")
    const props = { disabled, onClick}

    return (
      <button className={ cx("btn btn-default", classes) } { ...props } aria-label={ title }>
        <span className={ 'ti-' + icon }></span>
      </button>
    )
  }
}

Button.propTypes = {
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  className: PropTypes.string
}

export default Button
