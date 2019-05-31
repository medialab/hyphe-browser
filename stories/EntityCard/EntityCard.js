import './EntityCard.styl'

import React from 'react'
import cx from 'classnames'

console.log('in root')

const EntityCard = ({
  type = 'prospection',
  name,
  url,
  numberOfCitations,
  allowMerge = false,
  isActive
}) => {
  return (
    <li className={ cx('entity-card', type, {'is-active': isActive}) }>
      <div className="card-content">
        <h4 className="name">{name}</h4>
        <h5 className="url">{url}</h5>
        <div className="statistics">
          <i className="ti-link" />
          <span className="text">
            {numberOfCitations} citations by other webentities
          </span>
        </div>
      </div>
      <ul className="card-actions">
        {type !== 'out'
        &&
        <li className="hint--left" aria-label="move this webentity to the OUT list">
          <button className="btn btn-default">O</button>
        </li>
        }
        
        <li className="hint--left" aria-label="move this webentity to the UNDECIDED list">
          <button className="btn btn-default"><i className="ti-help" /></button>
        </li>

        {allowMerge
        &&
        <li className="hint--left" aria-label="merge this webentity in the currently browsed one">
          <button className="btn btn-default">M</button>
        </li>
        }
      </ul>
    </li>
  )
}

export default EntityCard