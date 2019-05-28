import './LinkedEntities.styl'

import '../../app/containers/SideBar/side-bar-contextual-lists.styl'

import React, { useState } from 'react'
import cx from 'classnames'

import HelpPin from '../../app/components/HelpPin'

let REFERRERS = [
  {
    name: 'gogol',
    homepage: 'https://google.com',
    id: 'google'
  }
]

let REFERRALS = [
  {
    name: 'faceboc',
    homepage: 'https://facebook.com',
    id: 'facebook'
  }
]
for (let i = 0 ; i < 3 ; i++) {
  REFERRERS = REFERRERS.concat(REFERRERS)
  REFERRALS = REFERRALS.concat(REFERRALS)
}


const LinkedEntities = function () {
  const [open, setOpen] = useState(true)
  const [selected, setSelected] = useState('referrers')
  const LINKS = selected === 'referrers' ? REFERRERS : REFERRALS
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
              <span>Linked webentities <HelpPin>about linked webentities</HelpPin></span>
                        
            </h3>
          
            {
              open &&
              <div>
                <div className="browser-side-bar-contextual-lists">
                  <nav>
                    {
                      // hide parents and children tabs for now
                      ['referrers', 'referrals'].map((l, index) => {
                        const handleSelectContextualList = () => setSelected(l)
                        return (
                          <button
                            className={ cx('btn', 'btn-default', 'navigation', { selected: l === selected }) }
                            key={ index } 
                            onClick={ handleSelectContextualList }
                          >
                            {l === 'referrers' ? 'Citing webentities' : 'Cited webentities'}
                          </button>
                        )
                      }
                      ) }

                    <div className="browser-side-bar-contextual-list">
                      <ul>
                        { LINKS.length ? LINKS.map((link, index) => {
                          
                          return (
                            <li key={ index } title={ link.name + '\n' + link.homepage }>
                              <div className="link-name">
                                <span>{ link.name }</span>
                                <span className="link-merge" >merge</span>
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
                    
                  </nav>
                </div>
              </div>
                        
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default LinkedEntities