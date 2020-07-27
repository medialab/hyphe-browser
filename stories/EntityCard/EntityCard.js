import './EntityCard.styl'

import React from 'react'
import cx from 'classnames'

const EntityCard = ({
  status = 'prospection',
  previousStatus,
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

  isVisited,
}) => {
  return (
    <li className={ cx('entity-card', status, { 'is-active': isActive }) }>
      {displayStatus
      &&
      <div className={ 'status-marker-container' }>
        {
          previousStatus ?
          <span className={ `status-marker previous-status ${previousStatus} hint--right` } aria-label={ `this webentity used to be in the ${previousStatus} list` }>{previousStatus.charAt(0).toUpperCase()}</span>
          : null
        }
        <span className={ `status-marker ${status} hint--right` } aria-label={ status === 'merged' ? 'this webentity has been merged within another one' : `this webentity is in the ${status} list` }>{status.charAt(0).toUpperCase()}</span>
        {status === 'prospection' && <span className={ `visited-marker ${status} hint--right` } aria-label={ isVisited ? 'this webentity has already been visited' : 'this webentity has not been visited yet' }>{isVisited ? '✓' : '?'}</span>}
        
      </div>}
      <div className="card-content hint--bottom" aria-label={ 'click to browse' }>
        <h4 className="name">{name}</h4>
        <h5 className="url">{url}</h5>
        <div className="statistics">
          <i className="ti-link" />
          <span className="text">
            cited by {numberOfCitations} webentities
          </span>
        </div>
      </div>
      <div className="card-actions">
        
        
        <ul className="card-actions-row">
          {status !== 'undecided'
        &&
        <li onClick={ onClickUndecided } className={ `hint--left ${isUndecidedActive ? 'is-active': ''}` } aria-label="move to the UNDECIDED list">
          <button className="btn btn-default">{/*<i className="ti-help" />*/}UND.</button>
        </li>}

          {status !== 'out'
        &&
        <li onClick={ onClickOut } className={ `hint--left ${isOutActive ? 'is-active': ''}` } aria-label="move to the OUT list">
          <button className="btn btn-default">OUT</button>
        </li>
          }
        </ul>

        <ul className="card-actions-row">
          {allowMerge
        &&
        <li onClick={ onClickMerge } className={ `hint--left ${isMergeActive ? 'is-active': ''}` } aria-label="merge that webentity with the current one">
          <button className="btn btn-default"><i className="ti-plus" /></button>
        </li>
          }
        </ul>
      </div>
    </li>
  )
}

export default EntityCard
