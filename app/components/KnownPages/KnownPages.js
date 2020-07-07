import './KnownPages.styl'

import React from 'react'
import { useIntl } from 'react-intl'

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
}) => {

  const { formatMessage } = useIntl()

  const handleDownloadList = () => {
    onDownloadList('mostLinked')
  }

  return (
    <div className="known-pages">
      <CardsList>
        { list && list.length ? list.map((link, index) => {
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
              innerWidth={ 166 }
              { ...link }
            />
          )
        }) : formatMessage({ id: 'none' }) }
      </CardsList>
      {
        list && list.length > 0 &&
        <div className="download-container">
          <DownloadListBtn onClickDownload={ handleDownloadList } />
        </div>
      }
    </div>
  )
}

export default KnownPages