import './EntityCard.styl'

import React from 'react'
import cx from 'classnames'

console.log('in root')

const EntityCard = ({
  type = 'prospection',
  name,
  url,
  numberOfCitations,
}) => {
  return (
    <li className={ cx('entity-card', type) }>
      <div className="card-content">
        <h4 className="name">{name}</h4>
        <h5 className="url">{url}</h5>
        <div className="statistics">
          <i className="ti-link" />
          <span>
            {numberOfCitations} citations by other webentities
          </span>
        </div>
      </div>
      <ul className="card-actions">
        {type !== 'out'
        &&
        <li className="hint--left" aria-label="put webentity to the 'out' list">
          <button className="btn btn-default">O</button>
        </li>
        }
        <li className="hint--left" aria-label="put webentity to the 'undecideds' list">
          <button className="btn btn-default"><i className="ti-help" /></button>
        </li>
      </ul>
    </li>
  )
}

export default EntityCard