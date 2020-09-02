import React from 'react'
import cx from 'classnames'
import { FormattedMessage as T, useIntl } from 'react-intl'

const letterWidth = 7.19

export const KnownPageCard = ({
  id,
  url,
  linked,
  isActive,
  isHomepage,
  isVisited,
  displayHomePageButton = true,
  innerWidth = 2048,
  onClick,
  onClickHomepage
}) => {

  const { formatMessage } = useIntl()

  const maxLetters = Math.ceil(innerWidth / letterWidth)

  return (
    <li onClick={ onClick } className={ cx('known-page-card', { 'is-active': isActive }, { 'is-visited': isVisited }) } key={ id }>
      <div className="card-content">
        <span title={ url } className="known-page-url" >{ url.length > maxLetters ? `…${url.slice(url.length + 1 - maxLetters, url.length)}` : url }</span>
        {linked && <div className="known-page-statistics">
          { formatMessage({ id: 'linked' }) }
          <T className="link-linked" id="linkedtimes" values={ { count: linked } } />
        </div>}
      </div>
      <div className="card-actions">
        {
          displayHomePageButton
          &&
          <button
            className={ cx('homepage-btn', { 'is-active': isHomepage }) }
            onClick = { onClickHomepage }
            title={ isHomepage ? formatMessage({ id: 'here-homepage' }) : formatMessage({ id: 'set-homepage' }) }
          >
            <span className="ti-layers-alt" />
          </button>
        }
      </div>
    </li>
  )
}

export default KnownPageCard