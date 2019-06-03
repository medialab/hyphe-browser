import './CardsList.styl'
import React from 'react'

const CardsList = ({ children }) => {
  return (
    <div className="cards-list">
      <ul className="list-container">
        {children}
      </ul>
    </div>
  )
}

export default CardsList