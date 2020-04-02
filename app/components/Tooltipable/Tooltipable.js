import './Tooltipable.styl'

import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
// import { useVisible } from 'react-hooks-visible'

/**
 * Note : in order to overcome a limitation with css-based tooltips when they are
 * displayed in components with hidden overflow,
 * this component uses the strategy of superpozing to the relatively positionned element
 * an fixed element which is used as the anchor of the tooltip and does not
 * suffer from hidden overflow issues.
 * @param {*} param0 
 */
const Tooltipable = ({
  children,
  Tag = 'div',
  style = {},
  className = '',
  ...props
}) => {
  const container = useRef(null)

  const [position, setPosition] = useState({})
  const [isHovered, setHovered] = useState(false)
  // const [targetRef, visible] = useVisible()

  const updatePos = () => {
    if (container) {
      const el = container.current
      const box = el.getBoundingClientRect()
      setPosition({
        left: Math.round(box.x),
        top: Math.round(box.y),
      })
    }
  }

  useEffect(() => {
    updatePos()
  }, [])

  const handleMouseEnter = () => {
    setHovered(true)
    updatePos()
  }
  const handleMouseLeave = () => {
    setHovered(false)
  }
  return (
    <>
      <Tag 
        { ...props } 
        style={ style }
        onMouseEnter={ handleMouseEnter }  
        onMouseLeave={ handleMouseLeave }  
        className={ `${className.replace('hint', '')} ${isHovered ? 'is-hidden': ''} tooltipable-anchor` }
        ref={ container } 
      >
        {children}
      </Tag>
      {/* <div style={{display: 'inline-block', width: 0, height: 0}} ref={targetRef} /> */}
      <Tag 
        { ...props } 
        className={ `${className} ${isHovered ? 'is-visible': ''} tooltipable-placeholder hint--always` }
        style={ { 
          ...style, 
          position: 'fixed', 
          ...position
        } }
      >
        {children}
      </Tag>
      
    </>
  )
}

Tooltipable.propTypes = {
  place: PropTypes.string,
  type: PropTypes.string,
  effect: PropTypes.string,
  className: PropTypes.string,
  // children: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.func, PropTypes.number])
}

export default Tooltipable