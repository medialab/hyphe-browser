import './CitedPages.styl'

import '../../app/containers/SideBar/side-bar-contextual-lists.styl'

import React, { useState } from 'react'
import cx from 'classnames'

import HelpPin from '../../app/components/HelpPin'


let PAGES = [
  {
    name: 'faceboc',
    homepage: 'https://facebook.com',
    id: 'facebook'
  },
  {
    name: 'toto',
    homepage: 'https://facebook.com/profile/toto',
    id: 'facebook'
  },
  {
    name: 'gilets jaunes',
    homepage: 'https://facebook.com/group/giles jaunes',
    id: 'facebook'
  },

]
for (let i = 0 ; i < 3 ; i++) PAGES = PAGES.concat(PAGES)

export const KnownPages = () => {
  return (
    <div>
      <div className="browser-side-bar-contextual-lists">
        <div className="browser-side-bar-contextual-list">
          <ul>
            { PAGES.length ? PAGES.map(link => {
                          
              return (
                <li key={ link.id } title={ link.name + '\n' + link.homepage }>
                  <div className="link-name">
                    <span>{ link.name }</span>
                    <span className="link-merge hint--left" aria-label="set as homepage" ><span className="ti-layers-alt" /></span>
                  </div>
                  <div className="link-url" >{ link.homepage }</div>
                </li>
              )
            }) : 'No links to display' }
          </ul>
        </div>
                    
        <div className="download">
          <button className='btn btn-default'>
            <strong>
                                    Download list as csv
              <span>&nbsp;</span>
              <span className="ti-download" />
            </strong>
          </button>
        </div>
      </div>
    </div>
  )
}

const CitedPages = function () {
  const [open, setOpen] = useState(true)
  return (
    <div className="browser-side-bar">
      <div className="browser-side-bar-sections">
          
        <div className="browser-side-bar-tags browser-research-notes">
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
              <span>Cited pages <HelpPin>about cited pages</HelpPin></span>
                        
            </h3>
          
            {
              open &&
              <KnownPages />
                        
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default CitedPages