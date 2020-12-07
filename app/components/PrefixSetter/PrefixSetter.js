import './PrefixSetter.styl'

import React, { useState, useRef, useEffect, createRef } from 'react'
import Draggable from 'react-draggable'
import cx from 'classnames'
import findLastIndex from 'lodash/fp/findLastIndex'
import findIndex from 'lodash/fp/findIndex'
import take from 'lodash/fp/take'

const findLastSelected = findLastIndex(part => part.selected)
const findFirstEditable = findIndex(part => part.editable)

const dict = {
  h: '.',
  p: '/',
}

const THRESHOLD = 0.25

const PrefixSetter =  ({
  parts = [],
  setPrefix
}) => {
  const initialIndex = findLastSelected(parts)
  let firstEditableIndex = findFirstEditable(parts) - 1
  if (firstEditableIndex <= 0) {
    firstEditableIndex = initialIndex
  }
  const [refs, setRefs] = useState([])

  useEffect(() => {
    setRefs(() => parts.map(() => createRef()))
  }, [])

  const container = useRef(null)
  const editableRef = useRef(null)
  const [index, setIndex] = useState(initialIndex)
  const [startingX, setStartingX] = useState(0)
  const [editableStyle, setEditableStyle] = useState(null)

  const setEditable = () => {
    const firstEditableNode = refs[firstEditableIndex] && refs[firstEditableIndex].current
    const firstEditableBox = firstEditableNode.getBoundingClientRect()
    const containerBox =  container.current.getBoundingClientRect()
    const left = firstEditableBox.x + firstEditableBox.width - containerBox.x
    let width
    // compute bounds offset and width, check if container has scrollbar
    if(container.current.scrollWidth > containerBox.width) {
      width = container.current.scrollWidth - left
    } else {
      // Offset 15px to make slider visible
      width = containerBox.width - 15 - left
    }
    setEditableStyle({
      left,
      width
    })
  }

  const setSliderX = (i = index) => {
    const anchor = refs[i] && refs[i].current
    const firstEditableNode = refs[firstEditableIndex] && refs[firstEditableIndex].current
    const firstEditableBox = firstEditableNode.getBoundingClientRect()
    if (anchor) {
      const box = anchor.getBoundingClientRect()
      const x = box.x - (firstEditableBox.x + firstEditableBox.width)
      setStartingX(Math.ceil(x + box.width + editableRef.current.scrollLeft) - 1)
    }
  }

  useEffect(()=> {
    if(refs && refs.length > 0) {
      setSliderX()
      setEditable()
    }
  }, [refs])


  const handleDrag = (event) => {
    const { clientX } = event
    refs.some((ref, refIndex) => {
      if (ref.current) {
        const box = ref.current.getBoundingClientRect()
        let maximum = box.x + box.width
        if (refIndex < refs.length - 1) {
          const boxNext = refs[refIndex + 1].current.getBoundingClientRect()
          maximum = boxNext.x + boxNext.width * THRESHOLD
        }
        if (clientX > box.x + box.width * THRESHOLD && clientX <= maximum && (parts[refIndex + 1] && parts[refIndex + 1].editable || parts[refIndex].editable)) {
          setIndex(refIndex)
          return true
        }
      }
    })
  }

  const handleStop = () => {
    setPrefix(
      take(index + 1, parts).reduce((prev, part) => `${prev}${part.name}|`, '')
    )
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
        <div
          ref={ editableRef }
          className="editable-wrapper"
          style={ editableStyle }
        >
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
        </div>
      </ul>
    </div>
  )

}

export default PrefixSetter
