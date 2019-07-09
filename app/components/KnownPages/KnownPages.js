import './KnownPages.styl'

import '../../containers/SideBar/side-bar-contextual-lists.styl'

import React, { useState } from 'react'
import { intlShape } from 'react-intl'

import DownloadListBtn from '../DownloadListBtn'
import CardsList from '../CardsList'
import KnownPageCard from './KnownPageCard'

import { compareUrls } from '../../utils/lru'

const KnownPages = ({
  list,
  tabUrl,
  homepage,
  onDownloadList,
  onSetHomepage,
  onSetTabUrl
}, { intl }) => {

  const { formatMessage } = intl

  const handleDownloadList = () => {
    onDownloadList('mostLinked')
  }
  
  return (
    <div className="known-pages">
      <CardsList>
        { list.length ? list.map((link, index) => {
          const isHomepage = compareUrls(homepage, link.url)
          const isActive = compareUrls(tabUrl, link.url)

          const handleSetHomepage = (e) => {
            e.stopPropagation()
            if (isHomepage) return
            onSetHomepage(link.url)
          }

          const handleSetTabUrl = () => {
            if (isActive) return
            onSetTabUrl(link.url)
          }

          return (
            <KnownPageCard 
              key={ index } 
              isActive={ isActive } 
              isHomepage={ isHomepage }
              onClick= { handleSetTabUrl }
              onClickHomepage = { handleSetHomepage }
              { ...link } 
            />
          )
        }) : formatMessage({ id: 'none' }) }
      </CardsList>
                    
      <div className="download">
        <DownloadListBtn onClickDownload={ handleDownloadList } />
      </div>
    </div>
  )
}

KnownPages.contextTypes = {
  intl: intlShape
}

export default KnownPages