import './EntityCard.styl'

import React from 'react'
import cx from 'classnames'

const EntityCard = ({
  link,
  allowMerge = false,
  displayStatus = true,
  isActive,
  isMergeActive,
  isUndecidedActive,
  isOutActive,
  
  onClickLink,
  onClickMerge,
  onClickOut,
  onClickUndecided,
}) => {
  const { status, name, homepage, indegree, viewed } = link
  const formattedStatus = status === 'DISCOVERED' ? 'prospection' : status
  
  return (
    <li 
      className={ cx('entity-card', status, { 'is-active': isActive }, { 'is-visited': viewed }) }
      onClick={ onClickLink }>
      {displayStatus
      &&
      <div className={ 'status-marker-container' }>
        <span className={ `status-marker ${status.toLowerCase()} hint--right` } aria-label={ `this webentity is in the ${formattedStatus} list` }>{formattedStatus.charAt(0).toUpperCase()}</span>
      </div>}
      <div className="card-content">
        <h4 className="name">{name}</h4>
        <h5 className="url">{homepage}</h5>
        {
          !!indegree && 
          <div className="statistics">
            <i className="ti-link" />
            <span className="text">
              cited by {indegree} webentities
            </span>
          </div>
        }
      </div>
      <div className="card-actions">
        
        
        <ul className="card-actions-row">
          {status !== 'UNDECIDED'
        &&
        <li onClick={ onClickUndecided } className={ `hint--left ${isUndecidedActive ? 'is-active': ''}` } aria-label="move to the UNDECIDED list">
          <button className="btn btn-default">{/*<i className="ti-help" />*/}UND.</button>
        </li>}

          {status !== 'OUT'
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