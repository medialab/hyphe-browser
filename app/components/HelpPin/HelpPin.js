import './HelpPin.styl'

import React from 'react'
import PropTypes from 'prop-types'

import Tooltipable from '../Tooltipable'

/**
 * Note : in order to overcome a limitation with css-based tooltips when they are
 * displayed in components with hidden overflow,
 * this component uses the strategy of superpozing to the relatively positionned element
 * an fixed element which is used as the anchor of the tooltip and does not
 * suffer from hidden overflow issues.
 * @param {*} param0
 */
const HelpPin = ({
  children,
  place = 'right',
  className = '',
}) => {
  return (
    <span>
     <Tooltipable
        Tag="span"
        className={`hint--${place} ${className}`}
        aria-label={ children }
      >
        <i className="ti-help-alt" />
     </Tooltipable>
    </span>
  )
}

HelpPin.propTypes = {
  place: PropTypes.string,
  className: PropTypes.string,
  // children: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.func, PropTypes.number])
}

export default HelpPin