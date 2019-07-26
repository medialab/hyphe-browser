import React from 'react'
import { intlShape } from 'react-intl'
import { USED_STACKS } from '../../constants'

const HeaderMetrics = ({ status }, { intl }) => {
  const { ready } = status && status.corpus
  if (!ready) return null

  const counters = status.corpus.traph.webentities
  const { formatMessage } = intl
  return (
    <ul className="header-metrics-container">
      {
        USED_STACKS.map((stack, index) => {
          return (
            <li 
              key={ index } 
              className="hint--bottom"
              aria-label={ `${counters[stack.id]} ${formatMessage({ id: `tooltip.stack-counter.${stack.id}` })}` }>
              <i className={ `metrics-icon ti-layout-column3-alt ${stack.value}` } />
              <span className="metrics"><span>{counters[stack.id]}</span> <label>{stack.label}</label>
              </span>
            </li>
          )
        })
      }
    </ul>)
}

HeaderMetrics.contextTypes = {
  intl: intlShape
}


export default HeaderMetrics