import './CardsList.styl'
import React from 'react'
import { FormattedMessage as T } from 'react-intl'


const CardsList = ({ children, displayLoader, count, total }) => {
  return (
    <div className="cards-list" >
      <ul className="list-container">
        {children}
      </ul>
      {
        displayLoader &&
        <div className="cards-list-loader">
          <T id="loading" />
          <span> ({ count } / { total } webpages)</span>
        </div>
      }
    </div>
  )
}

export default CardsList
