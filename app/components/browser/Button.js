import React, { PropTypes } from 'react'
import classNames from 'classnames'

const Button = ({ size, icon, onClick, disabled = false }) => (
  <button className={ classNames('btn btn-default', size && ('btn-' + size)) } disabled={ disabled } onClick={ onClick }>
    <span className={ 'icon icon-' + icon }></span>
  </button>
)

Button.propTypes = {
  size: PropTypes.oneOf(['mini', 'large']),
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default Button
