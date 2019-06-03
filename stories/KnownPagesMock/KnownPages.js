import './KnownPages.styl'

import '../../app/containers/SideBar/side-bar-contextual-lists.styl'

import React, { useState } from 'react'
import cx from 'classnames'

import DownloadListBtn from '../DownloadListBtn'
import EditionCartel from '../EditionCartel'
import CardsList from '../CardsList'

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

export const KnownPageCard = ({
  id,
  name,
  homepage,
  isActive,
  isHomePage,
  displayHomePageButton = true,

  onClick,
}) => {
  return (
    <li onClick={ onClick } className={ cx('known-page-card', { 'is-active': isActive }) } key={ id } title={ name + '\n' + homepage }>
      <div className="card-content">
        <div className="known-page-name">
          <span>{ name }</span>
        </div>
        <div className="known-page-url" >{ homepage }</div>
        <div className="known-page-statistics">
          {`cited ${parseInt(Math.random() * 40 + 1)} times`}
        </div>
      </div>
      <div className="card-actions">
        {
          displayHomePageButton
          &&
          <button 
            className={ cx('homepage-btn', 'hint--left', { 'is-active': isHomePage }) } 
            aria-label="set as the homepage of the webentity" 
          >
            <span className="ti-layers-alt" />
          </button>
        }
      </div>
    </li>
  )
}

export const KnownPages = ({
  activeIndex,
  homepageIndex
}) => {
  return (
    <div className="known-pages">
      <CardsList>
        { PAGES.length ? PAGES.map((link, index) => {
                          
          return (
            <KnownPageCard 
              key={ index } 
              isActive={ index === activeIndex } 
              isHomePage={ homepageIndex === index }
              { ...link } 
            />
          )
        }) : 'No links to display' }
      </CardsList>
                    
      <div className="download">
        <DownloadListBtn />
      </div>
    </div>
  )
}

const KnownPagesMock = function () {
  const [open, setOpen] = useState(true)
  return (
    <div style={ { width: 500, background: 'var(--color-grey-light)', padding: 10 } }>
      <EditionCartel
        isOpen={ open }
        onToggle={ () => setOpen(!open) }
        title={ 'Known webpages' }
        help={ 'Review known pages belonging to the currently browsed webentity' }
      >
        <KnownPages activeIndex={ 0 } homepageIndex={ 1 } />
      </EditionCartel>
    </div>
  )
}

export default KnownPagesMock