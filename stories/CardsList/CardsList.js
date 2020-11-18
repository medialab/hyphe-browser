import './CardsList.styl'
import React from 'react'

const CardsList = ({ children, displayLoader }) => {
  return (
    <div className="cards-list">
      <ul className="list-container">
        {children}
      </ul>
      {
        displayLoader &&
        <div className="cards-list-loader">
          Loading (1200 / 1600 webpages) 
        </div> 
      }
            
    </div>
  )
}

export default CardsList