import { useEffect, useRef } from 'react'

/**
 * Shamelessly taken from
 * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 *
 * This effect takes a function and a delay as inputs, and executes the function
 * every [delay] milliseconds, until the component is unmounted.
 *
 * @param fn    The function to execute
 * @param delay The delay, in milliseconds
 */
export function useInterval (fn, delay) {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = fn
  }, [fn])

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

/**
 * An advanced version of the `#useInterval` effect. The given function now
 * takes a callback `() => void` as argument. If this callback is called, the
 * given function will be executed again in [delay] milliseconds.
 *
 * @param asyncFn A function shaped as `(() => void) => void`
 * @param delay   The delay, in milliseconds
 */
export function useRetry (asyncFn, delay) {
  if (!delay) return

  const savedCallback = useRef()
  let aborted

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = asyncFn
  }, [asyncFn])

  // Set up the timeout
  useEffect(() => {
    let id

    function tick () {
      savedCallback.current(retry)
    }

    function retry () {
      if (!aborted) {
        id = setTimeout(tick, delay)
      }
    }

    function abort () {
      aborted = true
      clearTimeout(id)
    }

    tick()
    return abort
  }, [delay])
}
