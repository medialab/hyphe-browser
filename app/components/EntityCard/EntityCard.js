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
  actionsNewLine = false,

  onClickLink,
  onClickMerge,
  onClickOut,
  onClickUndecided,
}) => {
  const { status, name, homepage, indegree, previousStatus } = link
  const formattedStatus = status === 'DISCOVERED' ? 'suggestions' : status
  const [wrapperWidth, setWrapperWidth] = useState(null)
  const wrapperRef = useRef(null)

  const { formatMessage } = useIntl()

  useEffect(() => {
    const wrapperBox = wrapperRef && wrapperRef.current && wrapperRef.current.getBoundingClientRect()
    setWrapperWidth(wrapperBox.width)
  }, [])

  const prevStatus = previousStatus && (previousStatus === 'DISCOVERED' ? 'suggestions' : previousStatus.toLowerCase())

  const ActionButtons = () => {
    return(
      <ul className="card-actions-row">
        {status !== 'UNDECIDED' &&
          <Tooltipable Tag="li" onClick={ onClickUndecided } className={ `hint--right ${isUndecidedActive ? 'is-active': ''}` } aria-label={ formatMessage({ id: 'webentity-card.move-to-undecided' }) }>
            <button className="btn btn-default">{/*<i className="ti-help" />*/}UND.</button>
          </Tooltipable>
        }
        {status !== 'OUT' &&
          <Tooltipable Tag="li" onClick={ onClickOut } className={ `hint--right ${isOutActive ? 'is-active': ''}` } aria-label={ formatMessage({ id: 'webentity-card.move-to-out' }) }>
            <button className="btn btn-default">OUT</button>
          </Tooltipable>
        }
        {allowMerge &&
          <Tooltipable Tag="li" onClick={ onClickMerge } className={ `hint--right ${isMergeActive ? 'is-active': ''}` } aria-label={ formatMessage({ id: 'webentity-card.merge-with-current-entity' }) }>
            <button className="btn btn-default"><i className="ti-plus" /></button>
          </Tooltipable>
        }
      </ul>
    )
  }
  return (
    <li
      className={ cx('entity-card', status, { 'is-active': isActive }, { 'is-visited': isViewed }) }
      id={ `entity-card-${link.id}` }
      onClick={ onClickLink }
    >
      {displayStatus &&
        <div className={ 'status-marker-container' }>
          {
            previousStatus && previousStatus !== status &&
            <span
              className={ `status-marker previous-status ${previousStatus.toLowerCase()} hint--bottom-right` }
              aria-label={ formatMessage({ id: 'webentity-is-previous-in-list' },{ list: prevStatus.toUpperCase() }) }
            >
              {prevStatus.charAt(0).toUpperCase()}
            </span>
          }
          <span className={ `status-marker ${status.toLowerCase()} hint--bottom-right` } aria-label={ formatMessage({ id: 'webentity-is-in-list' },{ list: formattedStatus.toUpperCase() }) }>{formattedStatus.charAt(0).toUpperCase()}</span>
          {formattedStatus === 'suggestions' && <span className={ `viewed-marker ${status} hint--bottom-right` } aria-label={ isViewed ? formatMessage({ id: 'webentity-already-visited' }) : formatMessage({ id: 'webentity-never-visited' }) }>{isViewed ? '✓' : '?'}</span>}
        </div>
      }
      <div ref={ wrapperRef } className={ `card-content ${actionsNewLine && 'actions-new-line'}` }>
        <div aria-label={ name } className="name-wrapper hint--bottom">
          <h4 style={ { width: wrapperWidth } } className="name">{name}</h4>
        </div>
        <div className="homepage-wrapper hint--bottom" aria-label={ homepage }>
          <h5 className="url">{homepage}</h5>
        </div>
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
        { actionsNewLine  &&
          <div className="card-actions actions-new-line">
            <ActionButtons />
          </div>
        }
      </div>
      { !actionsNewLine  &&
        <div className="card-actions">
          <ActionButtons />
        </div>
      }
    </li>
  )
}

export default EntityCard
