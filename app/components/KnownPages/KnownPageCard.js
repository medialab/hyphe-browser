import React, { useRef, useState, useEffect } from 'react'
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
  onClick,
  onClickHomepage
}) => {

  const { formatMessage } = useIntl()
  const [ innerWidth, setInnerWidth ] = useState(300)
  const urlRef = useRef(null)

  useEffect(() => {
    const urlBox = urlRef && urlRef.current && urlRef.current.getBoundingClientRect()
    setInnerWidth(urlBox.width - 10)
  }, [])

  const maxLetters = Math.ceil(innerWidth / letterWidth)

  return (
    <li onClick={ onClick } className={ cx('known-page-card', { 'is-active': isActive }, { 'is-visited': isVisited }) } key={ id }>
      <div className="card-content" ref={ urlRef }>
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