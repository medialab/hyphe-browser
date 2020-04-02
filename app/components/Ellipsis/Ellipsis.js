import React, { useState, useEffect, useRef } from 'react'
import { fill } from 'lodash'

/**
 * Shamelessly taken from
 * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
function useInterval (callback, delay) {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick () {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

const Ellipsis = () => {
  const [dots, setDots] = useState(0)

  useInterval(() => {
    setDots((dots + 1) % 3)
  }, 500)

  return (
    <span>{fill(Array(dots + 1), '.').join('')}</span>
  )
}

export default Ellipsis
