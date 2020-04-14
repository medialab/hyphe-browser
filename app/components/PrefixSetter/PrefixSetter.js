import './PrefixSetter.styl'

import React, { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import cx from 'classnames'
import findLastIndex from 'lodash/fp/findLastIndex'
import findIndex from 'lodash/fp/findIndex'

const findLastSelected = findLastIndex(part => part.selected)
const findFirstEditable = findIndex(part => part.editable)

const dict = {
  h: '.',
  p: '/',
}

const PrefixSetter = function ({
  parts = [],
  setPrefix
}) {
  const initialIndex = findLastSelected(parts)
  let firstEditableIndex = findFirstEditable(parts) - 1
  if (firstEditableIndex <= 0) {
    firstEditableIndex = initialIndex
  }
  const refs = parts.map(() => useRef(null))
  const container = useRef(null)
  const [index, setIndex] = useState(initialIndex)
  const [startingX, setStartingX] = useState(0)

  const setSliderX = (i = index) => {
    const anchor = refs[i] && refs[i].current
    if (anchor) {
      const box = anchor.getBoundingClientRect()
      const x = box.x - container.current.getBoundingClientRect().x
      setStartingX(Math.ceil(x + box.width + container.current.scrollLeft) - 1)
    }
  }

  useEffect(setSliderX, [])

  const handleDrag = (event) => {
    const { clientX } = event
    refs.some((ref, refIndex) => {
      if (ref.current) {
        const box = ref.current.getBoundingClientRect()
        const THRESHOLD = 10
        if (clientX > box.x + THRESHOLD && clientX < box.x + THRESHOLD + box.width && (parts[refIndex + 1] && parts[refIndex + 1].editable || parts[refIndex].editable)) {
          setIndex(refIndex)
          return true
        }
      }
    })
  }

  const handleStop = () => {
    setPrefix(parts
      .filter((_, i) => i <= index )
      .reduce((prev, part) => `${prev}${part.name}|`, ''))
    setSliderX()
  }

  useEffect(() => {
    const id = setTimeout(() => container.current.scrollTo(Number.MAX_SAFE_INTEGER, 0), 0)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="prefix-setter">
      <ul ref={ container } className="parts-container">
        {
          parts.map((part, partIndex) => {
            const handleClick = () => {
              let selectedIndex = partIndex
              if (partIndex <= firstEditableIndex) {
                selectedIndex = firstEditableIndex
              } else if (partIndex === index) {
                selectedIndex = selectedIndex - 1
              }
              setIndex(selectedIndex)
              setPrefix(parts
                .filter((_, i) => i <= selectedIndex)
                .reduce((prev, part) => `${prev}${part.name}|`, '')
              )
              setSliderX(selectedIndex)
            }
            const [char, content] = part.name.split(':')
            return (
              <li
                key={ partIndex }
                ref={ refs[partIndex] }
                onClick={ handleClick }
                className={ cx('part', {
                  'active': !part.editable || index >= partIndex,
                  'editable': part.editable || partIndex === firstEditableIndex
                }) }
              >{dict[char]}{content.length ? content : '<empty>'}</li>
            )
          })
        }
        <Draggable
          bounds="parent"
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
