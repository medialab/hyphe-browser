import './Tags.styl'

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
// import cx from 'classnames'
import { Creatable } from 'react-select'
import {FormattedMessage as T} from 'react-intl'
import { uniqBy } from 'lodash'

import HelpPin from '../HelpPin'

const Tags = ({ 
  webentityId,
  initialTags,
  suggestions,
  onRemoveTag,
  onUpdateTag,
  onAddTag,
}, { intl: { formatMessage } }) => {
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

                  const handleUpdateTag = (option) => {
                    const newTag = option ? option.value.trim() : ''
                    
                    const prevTag = categories.find( (cat) => cat.category === category).value
                    if (prevTag) {
                      onRemoveTag(category, prevTag)
                    }
                    if (option) {
                      onAddTag(category, newTag)
                    }
                
                    setCategories(
                      categories.map((cat) => {
                        if (cat.category === category) {
                          return {
                            ...cat,
                            value: newTag
                          }
                        }
                        return cat
                      })
                    )
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
                          onChange={ handleUpdateTag }
                        />
                      </span>
                    </li>
                  )
                })
              }
            </ul>
            :
            <div className="no-categories-text">
              <T id="tags.corpus-has-no-categories" />
            </div>
        }
      </div>
      <form className="add-category-container">
        <input 
          placeholder={formatMessage({id: 'tags.new-category'})}
          className="add-category-input" 
          value={ newCategoryStr } 
          onChange={ e => setNewCategoryStr(e.target.value) } type="text" 
        />
        <button 
          disabled={ !newCategoryStr.length } 
          type="submit" 
          onClick={ onNewCat }
        >
          <T id="tags.add-category" /> <HelpPin><T id="tags.add-category-help" /></HelpPin>
        </button>
      </form>
    </div>
  )
}

Tags.contextTypes = {
  intl: PropTypes.object,
}

export default Tags