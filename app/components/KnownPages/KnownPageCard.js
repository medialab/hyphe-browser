import React from 'react'
import cx from 'classnames'
import { FormattedMessage as T, useIntl } from 'react-intl'

import Tooltipable from '../Tooltipable'
const letterWidth = 7.19

export const KnownPageCard = ({
  id,
  url,
  linked,
  isActive,
  isHomepage,
  displayHomePageButton = true,
  innerWidth = 2048,
  onClick,
  onClickHomepage
}) => {

  const { formatMessage } = useIntl()

  const maxLetters = Math.ceil(innerWidth / letterWidth)

  return (
    <li onClick={ onClick } className={ cx('known-page-card', { 'is-active': isActive }) } key={ id }>
      <div className="card-content">
        <Tooltipable Tag="span" className="hint--right" aria-label={ url }>
          <span className="known-page-url" >{ url.length > maxLetters ? `…${url.slice(url.length + 1 - maxLetters, url.length)}` : url }</span>
        </Tooltipable>
        {linked && <div className="known-page-statistics">
          { formatMessage({ id: 'linked' }) }
          <T className="link-linked" id="linkedtimes" values={ { count: linked } } />
        </div>}
      </div>
      <div className="card-actions">
        {
          displayHomePageButton
          &&
          <Tooltipable
            Tag="button"
            className={ cx('homepage-btn', 'hint--right', { 'is-active': isHomepage }) }
            onClick = { onClickHomepage }
            aria-label={ isHomepage ? formatMessage({ id: 'here-homepage' }) : formatMessage({ id: 'set-homepage' }) }
          >
            <span className="ti-layers-alt" />
          </Tooltipable>
        }
      </div>
    </li>
  )
}

export default KnownPageCard