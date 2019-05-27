import './Tags.styl'

import React, { useState } from 'react'

import cx from 'classnames'
import { Creatable } from 'react-select'

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
    <div className="browser-side-bar">
      <div className="browser-side-bar-sections">
  
        <div className="browser-side-bar-tags">
          <div>
            <h3
              onClick={ () => setOpen(!open) }
            >
              <span 
                className={ cx({
                  'ti-angle-up': open,
                  'ti-angle-down': !open
                }) }
              />
              <span>Tags <HelpPin>about tags</HelpPin></span>
                
            </h3>
  
            {
              open &&
                <div className="cartel-content">
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
                  <form onClick={ onNewCat } className="add-category-container">
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
                      Add category
                    </button>
                  </form>
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default TagsMock