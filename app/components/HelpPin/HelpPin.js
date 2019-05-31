import './HelpPin.styl'

import React, {useRef, useEffect, useState} from 'react'
import PropTypes from 'prop-types'

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
  const container = useRef(null)

  const [position, setPosition] = useState({})

  const updatePos = () => {
    if (container) {
      const el = container.current;
      const box = el.getBoundingClientRect()
      setPosition({
        left: box.x,
        top: box.y
      })
    }
  }

  useEffect(() => {
    updatePos()
  }) 
  return (
    <span className="help-pin" ref={container}>
      <span
        className={ `placeholder hint--${place} help-pin ${className}` }
        style={ { position: 'fixed', ...position } }
        aria-label={ children }
      >
        <span className="ti-help-alt" />
      </span>
      <span className="ti-help-alt" />
    </span>
  )
}

HelpPin.propTypes = {
  place: PropTypes.string,
  type: PropTypes.string,
  effect: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.func])
}

export default HelpPin