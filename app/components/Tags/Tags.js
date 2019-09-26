import './Tags.styl'

import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { Creatable } from 'react-select'
import { FormattedMessage as T } from 'react-intl'
import uniqBy from 'lodash/uniqBy'

const getSuggestions = (suggestions, category, value) => {
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

import HelpPin from '../HelpPin'

const Tags = (props, { intl: { formatMessage } }) => {
  const {
    webentityId,
    initialTags,
    suggestions,
    onRemoveTag,
    onUpdateTag,
    onAddTag,
  } = props
  const [categories, setCategories] = useState(initialTags)
  const [newCategoryStr, setNewCategoryStr] = useState('')
  const [newCategoryOpen, setNewCategoryOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setCategories(initialTags)
  }, [webentityId, initialTags])

  useEffect(() => {
    if (newCategoryOpen) {
      inputRef.current.focus()
    }
  }, [newCategoryOpen])

  const openCategory = React.useCallback(() => setNewCategoryOpen(true))
  const setCategory = React.useCallback(e => setNewCategoryStr(e.target.value))
  const onNewCat = React.useCallback(e => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    const newCategory = newCategoryStr.trim()
    const isCatExist = categories.find(({ category }) => category === newCategory)
    if (newCategory.length && !isCatExist) {
      setCategories([...categories, { category: newCategory, value: '' }])
      setNewCategoryStr('')
      setNewCategoryOpen(false)
    }
  }, [newCategoryStr, categories])

  const onDiscardNewCategory = React.useCallback(() => {
    setNewCategoryOpen(false)
    setNewCategoryStr('')
  })

  const handleNewCatKeyDown = React.useCallback(e => {
    if (e.key === 'Enter') {
      onNewCat()
    }
  })
  return (
    <div className="tags-container">
      <div className="categories-container">
        {
          categories.length ?
            <ul className="categories-list">
              {
                categories.map(({ category, value }) => {

                  const handleUpdateTag = (option) => {
                    const newTag = option ? option.value.trim() : ''
                    const prevTag = categories.find((cat) => cat.category === category).value
                    if (prevTag && option) {
                      onUpdateTag(category, prevTag, newTag)
                    } else {
                      if (prevTag) {
                        onRemoveTag(category, prevTag)
                      }
                      if (option) {
                        onAddTag(category, newTag)
                      }
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

                  const renderArrow = (props) => {
                    const { isOpen } = props
                    if (value.length > 0 && !isOpen) return null
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
                          options={ getSuggestions(suggestions, category, value) }
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
      <div className="add-category-container">
        {
          newCategoryOpen ?
            <form className="add-category-form">
              <input
                placeholder={ formatMessage({ id: 'tags.new-category' }) }
                className="add-category-input"
                value={ newCategoryStr }
                ref={ inputRef }
                onChange={ setCategory } 
                onKeyDown={ handleNewCatKeyDown }
                type="text"
              />
              <ul className="buttons-row">
                <li>
                  <button className="btn btn-error" onClick={ onDiscardNewCategory }>
                    <T id="cancel" />
                  </button>
                </li>
                <li>
                  <button type="submit" onClick={ onNewCat } className="btn btn-success" disabled={ !newCategoryStr.length }>
                    <T id="tags.add" />
                  </button>
                </li>
              </ul>
            </form>
            :
            <button
              className={ cx('btn btn-success add-category-btn', { 'no-categories': !categories.length }) }
              onClick={ openCategory }
            >
              <T id="tags.add-category" /> <HelpPin>{formatMessage({ id: 'tags.add-category-help' })}</HelpPin>
            </button>
        }
      </div>
    </div>
  )
}

Tags.contextTypes = {
  intl: PropTypes.object,
}

export default React.memo(Tags)
