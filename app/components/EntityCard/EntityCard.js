import './EntityCard.styl'

import React from 'react'
import PropTypes from 'prop-types';
import cx from 'classnames'

import {FormattedMessage as T} from 'react-intl'
import Tooltipable from '../Tooltipable'
import {ellipseStr} from '../../utils/misc'

const EntityCard = ({
  link,
  allowMerge = false,
  displayStatus = true,
  isActive,
  isMergeActive,
  isUndecidedActive,
  isOutActive,
  isViewed,
  
  onClickLink,
  onClickMerge,
  onClickOut,
  onClickUndecided,
}, {intl: { formatMessage }}) => {
  const { status, name, homepage, indegree, viewed } = link
  const formattedStatus = status === 'DISCOVERED' ? 'prospection' : status
  
  return (
    <li 
      className={ cx('entity-card', status, { 'is-active': isActive }, { 'is-visited': viewed }) }
      id={`entity-card-${link.id}`}
      onClick={ onClickLink }>
      {displayStatus
      &&
      <div className={ 'status-marker-container' }>
        <span className={ `status-marker ${status.toLowerCase()} hint--right` } aria-label={ formatMessage({id: 'webentity-is-in-list'},{list: formattedStatus.toUpperCase()}) }>{formattedStatus.charAt(0).toUpperCase()}</span>
        {formattedStatus === 'prospection' && <span className={ `viewed-marker ${status} hint--right` } aria-label={ isViewed ? formatMessage({id: 'webentity-already-visited'}) : formatMessage({id: 'webentity-never-visited'}) }>{isViewed ? '✓' : '?'}</span>}
      </div>}
      <div className="card-content">
        <h4 title={name} className="name">{ellipseStr(name, 25)}</h4>
        <h5 className="url">{homepage}</h5>
        {
          !!indegree && 
          <div className="statistics">
            <i className="ti-link" />
            <span className="text">
              <T
                id="webentity-card.cited-by-n-webentities" 
                values={{count: indegree}} 
              />
            </span>
          </div>
        }
      </div>
      <div className="card-actions">
        
        
        <ul className="card-actions-row">
          {
          status !== 'UNDECIDED'
          &&
          <Tooltipable Tag="li" onClick={ onClickUndecided } className={ `hint--right ${isUndecidedActive ? 'is-active': ''}` } aria-label={formatMessage({id: 'webentity-card.move-to-undecided'})}>
            <button className="btn btn-default">{/*<i className="ti-help" />*/}UND.</button>
          </Tooltipable>
        }

          {status !== 'OUT'
        &&
        <Tooltipable Tag="li" onClick={ onClickOut } className={ `hint--right ${isOutActive ? 'is-active': ''}` } aria-label={formatMessage({id: 'webentity-card.move-to-out'})}>
          <button className="btn btn-default">OUT</button>
        </Tooltipable>
          }
        </ul>

        <ul className="card-actions-row">
          {allowMerge
        &&
        <Tooltipable Tag="li" onClick={ onClickMerge } className={ `hint--right ${isMergeActive ? 'is-active': ''}` } aria-label={formatMessage({id: 'webentity-card.merge-with-current-entity'})}>
          <button className="btn btn-default"><i className="ti-plus" /></button>
        </Tooltipable>
          }
        </ul>
      </div>
    </li>
  )
}

EntityCard.contextTypes = {
  intl: PropTypes.object
}

export default EntityCard