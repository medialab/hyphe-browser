import './Tags.styl'

import React, { useState } from 'react'

// import cx from 'classnames'
import { Creatable } from 'react-select'
import EditionCartel from '../EditionCartel'

import HelpPin from '../../app/components/HelpPin'

const MOCK_OPTIONS = [
  {
    value: 'test 1',
    label: 'test 1'
  },
  {
    value: 'test 2',
    label: 'test 2'
  },
]

export const Tags = ({ 
  onNewCat,
  categories,
  setCategories,
  newCategoryStr, 
  setNewCategoryStr,
}) => {

  return (
    <div className="tags-container">
      <div className="categories-container">
        {
          categories.length ?
            <ul className="categories-list">
              {
                categories.map(({ category, value = '' }, categoryIndex) => {

                  const onChoose = ({ label }) => {
                    setCategories(
                      categories.map((cat, i) => {
                        if (i === categoryIndex) {
                          return {
                            ...cat,
                            value: label,
                            labe: label
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
                        
                        <Creatable
                          name="cat-select"
                          options={ [...MOCK_OPTIONS, { value, label: value }] }
                          clearable={ false }
                          searchable
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


const TagsMock = function ({ startingCategories = [] }){
  const [open, setOpen] = useState(true)

  const [categories, setCategories] = useState(startingCategories)
  const [newCategoryStr, setNewCategoryStr] = useState('')

  const onNewCat = e => {
    e.stopPropagation()
    e.preventDefault()
    if (newCategoryStr.length) {
      setCategories([...categories, { category: newCategoryStr, value: '' }])
      setNewCategoryStr('')
    }
  }
  
  return (
    <div style={ { width: 500, background: 'var(--color-grey-light)', padding: 10 } }>
      <EditionCartel
        isOpen={ open }
        onToggle={ () => setOpen(!open) }
        title={ 'Tags' }
        help={ 'Annotate the currently browsed webentity with categorized tags (this will be useful to group and visualize webentities)' }
      >
        <Tags 
          {
          ...{
            onNewCat,
            categories,
            setCategories,
            newCategoryStr, 
            setNewCategoryStr,
          }
          }
        />
      </EditionCartel>
    </div>
  )
}

export default TagsMock