import './HelpPin.styl'

import React from 'react'
import PropTypes from 'prop-types'


const HelpPin = ({
  children,
  place = 'right',
  className = '',
}) =>
  (
    <span
      className={ `hint--${place} help-pin ${className}` }
      style={ { position: 'relative' } }
      aria-label={ children }
    >
      <span className="ti-help-alt" />
    </span>
  )


HelpPin.propTypes = {
  place: PropTypes.string,
  type: PropTypes.string,
  effect: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.func])
}

export default HelpPin