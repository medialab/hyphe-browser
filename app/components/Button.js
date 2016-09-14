import React, { PropTypes } from 'react'
import classNames from 'classnames'

class Button extends React.Component {
  render () {
    const { size, icon, onClick, disabled = false, title } = this.props
    const props = { disabled, onClick, title }

    return (
      <button className={ classNames('btn btn-default', size && ('btn-' + size)) } { ...props }>
        <span className={ 'ti-' + icon }></span>
      </button>
    )
  }
}

Button.propTypes = {
  size: PropTypes.oneOf(['mini', 'large']),
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string
}

export default Button
