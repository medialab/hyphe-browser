import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

const Button = ({
  icon, 
  disabled = false, 
  title, 
  className = '', 
  onClick
}) => {
  const classes = className + (!~className.indexOf('hint--') && title ? ' hint--left' : '')

  return (
    <button 
      className={ cx('btn btn-default', classes) } 
      aria-label={ title }
      disabled={ disabled }
      onClick= { onClick }
    >
      <span className={ 'ti-' + icon } />
    </button>
  )
}

Button.propTypes = {
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  className: PropTypes.string
}

export default Button
