import React, { PropTypes } from 'react'
import cx from 'classnames'

class Button extends React.Component {
  render () {
    const { icon, onClick, disabled = false, title, className = '' } = this.props
    const props = { disabled, onClick, title }

    return (
      <button className={ cx("btn btn-default hint--left", className) } { ...props } aria-label={ title }>
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
