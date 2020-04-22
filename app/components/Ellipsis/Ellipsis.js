import { useState } from 'react'
import { fill } from 'lodash'

import { useInterval } from '../../utils/hooks'

const Ellipsis = () => {
  const [dots, setDots] = useState(0)

  useInterval(() => {
    setDots((dots + 1) % 3)
  }, 500)

  return (
    fill(Array(dots + 1), '.').join('')
  )
}

export default Ellipsis
