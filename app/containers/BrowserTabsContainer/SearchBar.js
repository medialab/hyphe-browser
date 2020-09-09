import './SearchBar.styl'

import React, { useState, useEffect, useRef } from 'react'

const SearchBar = ({
  id,
  eventBus,
  onUpdateSearch,
  onClearSearch,
  onHideSearchBar
}) => {
  const input = useRef(null)
  const [searchText, setSearchText] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    input.current.focus()
    eventBus.on('foundResult', (res) => setResult(res))
  }, [])

  const handleSearchText = (e) => {
    // const webview = document.getElementById(`webview-${ id }`)

    if (e.target.value.length > 0) {
      onUpdateSearch(e.target.value)
    } else {
      onClearSearch()
    }
    setSearchText(e.target.value)
  }
  const handleFindNext = () => {
    if (searchText.length > 0) {
      onUpdateSearch(searchText, 1)
    }
  }

  const handleFindPrev = () => {
    if (searchText.length > 0) {
      onUpdateSearch(searchText, -1)
    }
  }
  const handleKeyUp = (e) => {
    if (e.keyCode === 27) { // ESCAPE
      e.target.blur()
      setSearchText('')
      onHideSearchBar()
    }
    if (e.target.value.length > 0 && e.keyCode === 13 ) {
      if (e.shitKey) {
        onUpdateSearch(e.target.value, -1)
      } else {
        onUpdateSearch(e.target.value, 1)
      }

    }
  }
  return (
    <div
      id={ `searchbar-${ id }` }
      className="searchbar-container"
      style={ { position: 'fixed', zIndex: 1, bottom: '0px' } }
    >
      <span className="search-input">
        <input
          ref={ input }
          value={ searchText }
          type="text"
          onKeyUp={ handleKeyUp }
          onChange={ handleSearchText }
        />
      </span>
      {searchText.length && result ?
        <span className="search-result">
          <button onClick={ handleFindPrev }><i className="ti-angle-up" /></button>
          <button onClick={ handleFindNext }><i className="ti-angle-down" /></button>
          <span>{ result.activeMatchOrdinal }/{ result.matches }</span>
        </span>
        : null
      }
    </div>
  )
}

export default SearchBar
