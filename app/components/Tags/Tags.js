import './Tags.styl'

import React, { useState, useEffect, useRef } from 'react'
import cx from 'classnames'
import Creatable from 'react-select/creatable'
import { FormattedMessage as T, useIntl } from 'react-intl'
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

const TagCreatable = ({
  value,
  suggestions,
  category,
  handleUpdateTag,
}) => {
  const creatableRef = useRef(null)

  const customStyles = {
    control: (base) => ({
      ...base,
      fontSize: '12px',
      border: '1px solid lightgrey',
      boxShadow: 'none'
    }),
    option: (base) => ({
      ...base,
      color: '#000000'
    }),
    menu: base => ({
      ...base,
      fontSize: '12px',
      // kill the gap
      marginTop: 0,
    })
  }

  // make Creatable editable
  const handleFocus = () => {
    if (value.length && creatableRef.current) {
      creatableRef.current.select.select.handleInputChange({
        currentTarget: { value }
      })
    }
  }

  const handleMenuClose = () => {
    if (value.length && creatableRef.current) {
      creatableRef.current.blur()
    }
  }

  return (
    <Creatable
      ref={ creatableRef }
      styles= { customStyles }
      theme={ theme => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: '#F0F0F0',
          primary: '#DEEBFF',
        },
      }) }
      name="cat-select"
      isClearable={ value.length > 0 ? true : false }
      components={ { DropdownIndicator:() => null, IndicatorSeparator:() => null } }
      blurInputOnSelect
      autoFocus={ false }
      options={ getSuggestions(suggestions, category, value) }
      value={ { value, label: value } }
      onFocus={ handleFocus }
      onMenuClose= { handleMenuClose }
      onChange={ handleUpdateTag }
    />
  )
}

const Tags = (props) => {
  const {
    webentityId,
    initialTags,
    suggestions,
    onRemoveTag,
    onUpdateTag,
    onAddTag,
  } = props

  const [categories, setCategories] = useState([])

  useEffect(() => setCategories([]) , [webentityId])

  const cachedCategories = React.useMemo(
    () => [
      ...initialTags.map(tag => categories.find(cat => tag.category === cat.category) || tag),
      ...categories.filter(cat => !initialTags.find(tag => tag.category === cat.category))
    ],
    [categories, initialTags, webentityId]
  )

  const [newCategoryStr, setNewCategoryStr] = useState('')
  const [newCategoryOpen, setNewCategoryOpen] = useState(false)
  const inputRef = useRef(null)
  const { formatMessage } = useIntl()

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
          cachedCategories.length ?
            <ul className="categories-list">
              {
                cachedCategories
                .sort((a, b) => a.category.toLowerCase().localeCompare(b.category.toLowerCase()))
                .map(({ category, value }) => {

                  const handleUpdateTag = (option, {action}) => {
                    console.log(action)
                    const newTag = option ? option.value.trim() : ''
                    const prevTag = cachedCategories.find((cat) => cat.category === category).value
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
                      cachedCategories.map((cat) => {
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

                  return (
                    <li className="category-item-container" key={ category }>
                      <span className="category-name">
                        {category}
                      </span>
                      <span className="category-input">
                        <TagCreatable
                          value={ value }
                          category={ category }
                          suggestions={ suggestions }
                          handleUpdateTag={ handleUpdateTag }
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

export default React.memo(Tags)
