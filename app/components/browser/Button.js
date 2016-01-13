import React, { PropTypes } from 'react'
import classNames from 'classnames'

class Button extends React.Component {
  render () {
    const { size, icon, onClick, disabled = false } = this.props

    return (
      <button className={ classNames('btn btn-default', size && ('btn-' + size)) } disabled={ disabled } onClick={ onClick }>
        <span className={ 'icon icon-' + icon }></span>
      </button>
    )
  }
}

Button.propTypes = {
  size: PropTypes.oneOf(['mini', 'large']),
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default Button
