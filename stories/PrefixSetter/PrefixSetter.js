import './PrefixSetter.styl'

import React, { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import cx from 'classnames'

const PrefixSetter = function ({
  parts = []
}) {
  let initialIndex
  parts.some((p, i) => {
    if (p.editable) {
      initialIndex = i
      return true
    }
  })
  const refs = []
  parts.forEach(p => {
    refs.push(useRef(null))
  })
  const [index, setIndex] = useState(initialIndex)
  const [startingX, setStartingX] = useState(0)

  const setSliderX = () => {
    const anchor = refs && refs[index] && refs[index].current
    if (anchor) {
      const box = anchor.getBoundingClientRect()
      setStartingX(box.x + box.width - 10)
    }
  }

  useEffect(() => {
    setSliderX()
  })

  const handleDrag = (event) => {
    const { clientX } = event
    refs.some((ref, refIndex) => {
      if (ref.current) {
        const box = ref.current.getBoundingClientRect()
        if (clientX > box.x && clientX < box.x + box.width && parts[refIndex].editable) {
          setIndex(refIndex)
          return true
        }
      }
    })
  }

  const handleStop = () => {
    setSliderX()
  }

  return (
    <div className="prefix-setter">
      <ul className="parts-container">
        {
          parts.map((part, partIndex) => {
            const handleClick = () => {
              if (part.editable) {
                setIndex(partIndex)
              }
            }
            return (
              <li
                key={ partIndex }
                ref ={ refs[partIndex] }
                onClick={ handleClick }
                className={ cx('part', {
                  'active': !part.editable || index >= partIndex,
                  'editable': part.editable
                }) }
              >{part.name}</li>
            )
          })
        }
        <Draggable
          axis="x"
          handle=".slider-handle"
          defaultPosition={ { x: startingX, y: 0 } }
          position={ { x: startingX, y: 0 } }
          grid={ [2, 2] }
          scale={ 1 }
          onDrag={ handleDrag }
          onStop={ handleStop }
        >
          <span className="slider">
            <span className="slider-handle" />
          </span>
        </Draggable>
      </ul>
    </div>
  )
        
}

export default PrefixSetter