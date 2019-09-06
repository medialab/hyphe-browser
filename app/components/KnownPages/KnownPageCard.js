import React from 'react'
import cx from 'classnames'
import { FormattedMessage as T, intlShape } from 'react-intl'

import Tooltipable from '../Tooltipable'

export const KnownPageCard = ({
  id,
  url,
  linked,
  isActive,
  isHomepage,
  displayHomePageButton = true,

  onClick,
  onClickHomepage
}, { intl }) => {

  const { formatMessage } = intl

  return (
    <li onClick={ onClick } className={ cx('known-page-card', { 'is-active': isActive }) } key={ id } title={ url }>
      <div className="card-content">
        <div className="known-page-url" >{ url }</div>
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
            aria-label={ isHomepage ? formatMessage({ id: 'here-homepage' }): formatMessage({ id: 'set-homepage' }) }
          >
            <span className="ti-layers-alt" />
          </Tooltipable>
        }
      </div>
    </li>
  )
}

KnownPageCard.contextTypes = {
  intl: intlShape
}


export default KnownPageCard