import './Tags.styl'

import React, { useState, useEffect } from 'react'
// import cx from 'classnames'
import { Creatable } from 'react-select'
import { uniqBy } from 'lodash'

import HelpPin from '../HelpPin'

const Tags = ({ 
  webentityId,
  initialTags,
  suggestions,
  onRemoveTag,
  onAddTag,
}) => {
  const [categories, setCategories] = useState(initialTags)
  const [newCategoryStr, setNewCategoryStr] = useState('')
  
  useEffect(() => {
    setCategories(initialTags)
  }, [webentityId])

  const onNewCat = e => {
    e.stopPropagation()
    e.preventDefault()
    const newCategory = newCategoryStr.trim()
    const isCatExist = categories.find(({ category }) => category === newCategory)

    if (newCategory.length && !isCatExist)  {
      setCategories([...categories, { category: newCategory, value: '' }])
      setNewCategoryStr('')
    }
  }

  const handleUpdateTag = (category, option) => {
    const prevTag = categories.find( (cat) => cat.category === category).value
    if (prevTag) {
      onRemoveTag(category, prevTag)
    }
    if (option) {
      onAddTag(category, option.value)
    }

    setCategories(
      categories.map((cat) => {
        if (cat.category === category) {
          return {
            ...cat,
            value: option ? option.value : ''
          }
        }
        return cat
      })
    )
  }

  return (
    <div className="tags-container">
      <div className="categories-container">
        {
          categories.length ?
            <ul className="categories-list">
              {
                categories.map(({ category, value }, categoryIndex) => {
                  
                  const getSuggestions = () => {
                    let suggestionOptions = []
                    if (suggestions[category]) {
                      suggestionOptions = Object.keys(suggestions[category]).map((value) => {
                        return {
                          value,
                          label: value
                        }
                      })
                    }
                    return uniqBy([...suggestionOptions, { value, label: value }], 'value')
                  }

                  const onChoose = (option) => {
                    if (option && option.value && option.value.trim().length === 0) return    
                    handleUpdateTag(category, option)
                  }

                  const renderArrow = ({ isOpen })  => {
                    if (value.length>0 && !isOpen) return null
                    else {
                      return (isOpen ? <span className="ti-angle-up" /> : <span className="ti-angle-down" />)
                    }
                  }

                  return (
                    <li className="category-item-container" key={ category }>
                      <span className="category-name">
                        {category}
                      </span>
                      <span className="category-input">
                        <Creatable
                          name="cat-select"
                          clearable={ value.length > 0 ? true : false }
                          backspaceRemoves={ false }
                          searchable
                          autoFocus
                          autoBlur
                          ignoreCase
                          arrowRenderer={ renderArrow }
                          options={ getSuggestions() }
                          value={ value }
                          onChange={ onChoose }
                        />
                      </span>
                    </li>
                  )
                })
              }
            </ul>
            :
            <div className="no-categories-text">The corpus has no tag categories yet</div>
        }
      </div>
      <form className="add-category-container">
        <input 
          placeholder="New category name" 
          className="add-category-input" 
          value={ newCategoryStr } 
          onChange={ e => setNewCategoryStr(e.target.value) } type="text" 
        />
        <button 
          disabled={ !newCategoryStr.length } 
          type="submit" 
          onClick={ onNewCat }
        >
          Add category <HelpPin>Help about categories</HelpPin>
        </button>
      </form>
    </div>
  )
}

export default Tags