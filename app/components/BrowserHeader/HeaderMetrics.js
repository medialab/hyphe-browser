import React from 'react'
import { intlShape } from 'react-intl'
import { USED_STACKS } from '../../constants'

const HeaderMetrics = ({ status, onSelectStack }, { intl }) => {
  const { ready } = status && status.corpus
  if (!ready) return null

  const counters = status.corpus.traph.webentities
  const { formatMessage } = intl
  return (
    <ul className="header-metrics-container">
      {
        USED_STACKS.map((stack, index) => {
          const handleSelectStack = () => {
            onSelectStack(stack.id)
          }
          return (
            <li 
              key={ index } 
              className="hint--bottom"
              onClick={ handleSelectStack }
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