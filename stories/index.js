
/**
 * Global style imports
 */
import '../app/css/style.styl'
import '../app/css/themify-icons.css'
import '../app/css/hint.base.css'

/**
 * Components specific style imports
 */
import '../app/containers/SideBar/side-bar-tags.styl'
import '../app/containers/SideBar/side-bar.styl'

/**
 * Storybook specific style imports
 */
import './stories.styl'
/**
 * JS libs import
 */
import React, {useState} from 'react'
import cx from 'classnames'

import { storiesOf } from '@storybook/react'

/**
 *  Components import
 */
import HelpPin from '../app/components/HelpPin'
// import Button from '../app/components/Button'

/**
 * ================================================
 * ----------------- STORIES ----------------------
 * ================================================
 */

/**
 * Help pin
 */
 const PinExample = function(){
  const [open, setOpen] = useState(true)
  return (
    <div className="browser-side-bar">
      <div className="browser-side-bar-sections">

        <div className="browser-side-bar-tags">
          <div>
            <h3
              onClick={() => setOpen(!open)}
            >
              <span 
                className={ cx({
                  'ti-angle-up': open,
                  'ti-angle-down': !open
                }) } />
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
storiesOf('Help pin (embedded documentation)')
  .add('example', () => <PinExample />)