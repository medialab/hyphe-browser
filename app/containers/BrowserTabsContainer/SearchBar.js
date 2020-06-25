import React, { useState, useEffect, useRef } from 'react'

const SearchBar = ({ 
  id, 
  onUpdateSearch,
  onClearSearch,
  onFindNext,
  onHideSearchBar 
}) => {
  const input = useRef(null)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    input.current.focus()
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
      onClearSearch()
      onHideSearchBar()
    }

    // if (e.keyCode === 13) {
    //   console.log(e.target.value)
    //   onFindNext(e.target.value)
    // }
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
    </div>
  )
}

export default SearchBar
