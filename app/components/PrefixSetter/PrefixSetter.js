import './PrefixSetter.styl'

import React, { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import cx from 'classnames'

const PrefixSetter = function ({
  parts = []
}) {
  let initialIndex = parts.length - 1
  parts.some((p, i) => {
    if (p.editable) {
      initialIndex = i
      return true
    }
  })
  const refs = []
  parts.forEach(() => {
    refs.push(useRef(null))
  })
  const container = useRef(null)
  const [index, setIndex] = useState(initialIndex)
  const [startingX, setStartingX] = useState(0)

  const setSliderX = () => {
    const anchor = refs && refs[index] && refs[index].current
    if (anchor) {
      const box = anchor.getBoundingClientRect()
      const x = box.x - container.current.getBoundingClientRect().x
      setStartingX(x + box.width)
    }
  }

  useEffect(() => {
    setSliderX()
    setTimeout(() => setSliderX())
  })

  const handleDrag = (event) => {
    const { clientX } = event
    refs.some((ref, refIndex) => {
      if (ref.current) {
        const box = ref.current.getBoundingClientRect()
        const THRESHOLD = 10;
        if (clientX > box.x + THRESHOLD && clientX < box.x + THRESHOLD + box.width && parts[refIndex].editable) {
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
      <ul ref={ container } className="parts-container">
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
          bounds='parent'
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