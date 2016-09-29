import React, { PropTypes } from 'react'

class Button extends React.Component {
  render () {
    const { icon, onClick, disabled = false, title } = this.props
    const props = { disabled, onClick }

    return (
      <button className="btn btn-default hint--left" { ...props } aria-label={ title }>
        <span className={ 'ti-' + icon }></span>
      </button>
    )
  }
}

Button.propTypes = {
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string
}

export default Button
