import './HelpPin.styl'

import React from 'react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons/faQuestionCircle'


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
      <FontAwesomeIcon icon={ faQuestionCircle } />
    </span>
  )


HelpPin.propTypes = {
  place: PropTypes.string,
  type: PropTypes.string,
  effect: PropTypes.string,
  className: PropTypes.string,
}

export default HelpPin