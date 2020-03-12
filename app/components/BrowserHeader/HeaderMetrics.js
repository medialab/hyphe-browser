import React, { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { USED_STACKS } from '../../constants'
import { formatCounter } from '../../utils/misc'

const HeaderMetrics = ({ status }) => {
  const { ready } = status && status.corpus
  const { formatMessage } = useIntl()
  

  const counters = status.corpus.traph.webentities

  const [changed, setChanged] = useState({})
  const [statuses, setStatuses] = useState(counters)

  useEffect(() => {
    setChanged(
      USED_STACKS.reduce((res, stack) =>({
        ...res, 
        [stack.id]: counters[stack.id] !== statuses[stack.id]
      }), {})
    )
    const anim = setTimeout(() => {
      setChanged({})
    }, 1000)
    setStatuses(counters)
    return () => clearTimeout(anim)
  }, [counters, ready])

  return (
    <ul className="header-metrics-container">
      {
        USED_STACKS.map((stack, index) => {
          return (
            <li 
              key={ index } 
              className="hint--bottom"
              aria-label={ `${counters[stack.id]} ${formatMessage({ id: `tooltip.stack-counter.${stack.id}` })}` }
            >
              <i className={ `metrics-icon ti-layout-column3-alt ${stack.value} ${changed[stack.id] ? 'changed' : ''}` } />
              <span className={ `metrics  ${changed[stack.id] ? 'changed' : ''}` }><span>{formatCounter(counters[stack.id])}</span> <label>{stack.label}</label>
              </span>
            </li>
          )
        })
      }
    </ul>
  )
}

export default HeaderMetrics