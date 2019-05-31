import './CitedPages.styl'

import '../../app/containers/SideBar/side-bar-contextual-lists.styl'

import React, { useState } from 'react'
import cx from 'classnames'

import HelpPin from '../../app/components/HelpPin'
import DownloadListBtn from '../DownloadListBtn'


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

export const KnownPages = ({
  activeIndex,
  homepageIndex
}) => {
  return (
    <div className="known-pages">
        <div className="known-pages-wrapper">
          <ul className="known-pages-list">
            { PAGES.length ? PAGES.map((link, index) => {
                          
              return (
                <li className={cx('known-page-card', {'is-active': index === activeIndex})} key={ link.id } title={ link.name + '\n' + link.homepage }>
                  <div className="card-content">
                    <div className="known-page-name">
                      <span>{ link.name }</span>
                    </div>
                    <div className="known-page-url" >{ link.homepage }</div>
                  </div>
                  <div className="card-actions">
                    <button className={cx('homepage-btn', 'hint--left', {'is-active': homepageIndex === index})} aria-label="set this webpage as the homepage of the webentity" ><span className="ti-layers-alt" /></button>
                  </div>
                </li>
              )
            }) : 'No links to display' }
          </ul>
        </div>
                    
        <div className="download">
          <DownloadListBtn />
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