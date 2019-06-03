import './EntityCard.styl'

import React from 'react'
import cx from 'classnames'

const EntityCard = ({
  status = 'prospection',
  name,
  url,
  numberOfCitations,
  allowMerge = false,
  displayStatus = true,
  isActive,
  isMergeActive,
  isUndecidedActive,
  isOutActive,

  onClickMerge,
  onClickOut,
  onClickUndecided,
}) => {
  return (
    <li className={ cx('entity-card', status, { 'is-active': isActive }) }>
      {displayStatus
      &&
      <div className={ 'status-marker-container' }>
        <span className={ `status-marker ${status} hint--right` } aria-label={ `this webentity is in the ${status} list` }>{status.charAt(0).toUpperCase()}</span>
      </div>}
      <div className="card-content hint--bottom" aria-label={ 'click to browse' }>
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
        {status !== 'out'
        &&
        <li onClick={ onClickOut } className={ `hint--left ${isOutActive ? 'is-active': ''}` } aria-label="move to the OUT list">
          <button className="btn btn-default">O</button>
        </li>
        }
        
        {status !== 'undecided'
        &&
        <li onClick={ onClickUndecided } className={ `hint--left ${isUndecidedActive ? 'is-active': ''}` } aria-label="move to the UNDECIDED list">
          <button className="btn btn-default"><i className="ti-help" /></button>
        </li>}

        {allowMerge
        &&
        <li onClick={ onClickMerge } className={ `hint--left ${isMergeActive ? 'is-active': ''}` } aria-label="merge that webentity with the current one">
          <button className="btn btn-default">M</button>
        </li>
        }
      </ul>
    </li>
  )
}

export default EntityCard