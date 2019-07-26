import './KnownPages.styl'

import React, { useState } from 'react'

import DownloadListBtn from '../DownloadListBtn'
import EditionCartel from '../EditionCartel'
import CardsList from '../CardsList'
import KnownPageCard from './KnownPageCard'

let PAGES = [
  {
    homepage: 'https://facebook.com',
    id: 'facebook'
  },
  {
    homepage: 'https://facebook.com/profile/toto',
    id: 'facebook'
  },
  {
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