import './EntityCard.styl'

import React, { useRef, useEffect, useState } from 'react'
import cx from 'classnames'

import { FormattedMessage as T, useIntl } from 'react-intl'
import Tooltipable from '../Tooltipable'

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
}) => {
  const { status, name, homepage, indegree, viewed, previousStatus } = link
  const formattedStatus = status === 'DISCOVERED' ? 'prospection' : status
  const [wrapperWidth, setWrapperWidth] = useState(null)
  const wrapperRef = useRef(null)

  const { formatMessage } = useIntl()

  useEffect(() => {
    const wrapperBox = wrapperRef && wrapperRef.current && wrapperRef.current.getBoundingClientRect()
    setWrapperWidth(wrapperBox.width)
  }, [])

  const prevStatus = previousStatus && (previousStatus === 'DISCOVERED' ? 'prospection' : previousStatus.toLowerCase())
  return (
    <li
      className={ cx('entity-card', status, { 'is-active': isActive }, { 'is-visited': viewed }) }
      id={ `entity-card-${link.id}` }
      onClick={ onClickLink }
    >
      {displayStatus
      &&
      <div className={ 'status-marker-container' }>
        {
          prevStatus &&
          <span
            className={ `status-marker previous-status ${previousStatus.toLowerCase()} hint--right` }
            aria-label={ formatMessage({ id: 'webentity-is-previous-in-list' },{ list: prevStatus.toUpperCase() }) }
          >
            {prevStatus.charAt(0).toUpperCase()}
          </span>
        }
        <span className={ `status-marker ${status.toLowerCase()} hint--right` } aria-label={ formatMessage({ id: 'webentity-is-in-list' },{ list: formattedStatus.toUpperCase() }) }>{formattedStatus.charAt(0).toUpperCase()}</span>
        {formattedStatus === 'prospection' && <span className={ `viewed-marker ${status} hint--right` } aria-label={ isViewed ? formatMessage({ id: 'webentity-already-visited' }) : formatMessage({ id: 'webentity-never-visited' }) }>{isViewed ? '✓' : '?'}</span>}
      </div>}
      <div ref={ wrapperRef } className="card-content">
        <div aria-label={ name } className="name-wrapper hint--bottom">
          <h4 style={ { width: wrapperWidth } } className="name">{name}</h4>
        </div>
        <h5 className="url">{homepage}</h5>
        {
          !!indegree &&
          <div className="statistics">
            <i className="ti-link" />
            <span className="text">
              <T
                id="webentity-card.cited-by-n-webentities"
                values={ { count: indegree } }
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
          <Tooltipable Tag="li" onClick={ onClickUndecided } className={ `hint--right ${isUndecidedActive ? 'is-active': ''}` } aria-label={ formatMessage({ id: 'webentity-card.move-to-undecided' }) }>
            <button className="btn btn-default">{/*<i className="ti-help" />*/}UND.</button>
          </Tooltipable>
          }

          {status !== 'OUT'
        &&
        <Tooltipable Tag="li" onClick={ onClickOut } className={ `hint--right ${isOutActive ? 'is-active': ''}` } aria-label={ formatMessage({ id: 'webentity-card.move-to-out' }) }>
          <button className="btn btn-default">OUT</button>
        </Tooltipable>
          }
        </ul>

        <ul className="card-actions-row">
          {allowMerge
        &&
        <Tooltipable Tag="li" onClick={ onClickMerge } className={ `hint--right ${isMergeActive ? 'is-active': ''}` } aria-label={ formatMessage({ id: 'webentity-card.merge-with-current-entity' }) }>
          <button className="btn btn-default"><i className="ti-plus" /></button>
        </Tooltipable>
          }
        </ul>
      </div>
    </li>
  )
}

export default EntityCard