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

  const handleKeyUp = (e) => {
    if (e.keyCode === 27) { // ESCAPE
      e.target.blur()
      setSearchText('')
      onHideSearchBar()
    }

    if (e.target.value.length > 0 && e.keyCode === 13 ) {
      onUpdateSearch(e.target.value)
    }
  }
  return (
    <div
      id={ `searchbar-${ id }` }
      style={ { position: 'fixed', zIndex: 1, bottom: '0px' } }
    >
      <input
        ref={ input }
        value={ searchText }
        type="text"
        onKeyUp={ handleKeyUp }
        onChange={ handleSearchText }
      />
      {searchText.length && result ?
        <span>{ result.activeMatchOrdinal }/{ result.matches }</span>
        : null
      }
    </div>
  )
}

export default SearchBar
