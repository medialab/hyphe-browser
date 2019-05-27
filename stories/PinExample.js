import React, { useState } from 'react'

import cx from 'classnames'

import HelpPin from '../app/components/HelpPin'


const PinExample = function (){
  const [open, setOpen] = useState(true)
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
                <form className="browser-side-bar-tags-new-category">
                  {/* <input 
                    placeholder={ 'add category' }
                    value={ '' }
                  />
                  <Button icon="plus" /> */}
                  tags contents
                </form>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default PinExample