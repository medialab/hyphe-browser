import './CardsList.styl'
import React, { useEffect, useRef } from 'react'

const CardsList = ({ onLoadPages, children }) => {
  const listRef = useRef(null)

  const handleScroll = () => {
    const scroller = listRef.current
    if (scroller.scrollHeight - scroller.scrollTop <= scroller.clientHeight && onLoadPages) {
      onLoadPages()
    }
  }

  return (
    <div className="cards-list" >
      <ul ref={listRef} onScroll={ handleScroll } className="list-container">
        {children}
      </ul>
    </div>
  )
}

export default CardsList
