import React, { useState } from 'react'
import { fill } from 'lodash'

import { useInterval } from '../../utils/hooks'

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
