import React from 'react'
import { intlShape } from 'react-intl'
import { USED_STACKS } from '../../constants'

const formatCounter = nb => {
  if (nb < 1000) {
    return nb;
  }
  return parseInt(nb/1000) + '.' + ('' + nb/1000%1000).substr(0, 1) + 'k'
}

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
              <span className="metrics"><span>{formatCounter(counters[stack.id])}</span> <label>{stack.label}</label>
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