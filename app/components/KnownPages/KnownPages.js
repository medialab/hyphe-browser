import './KnownPages.styl'

import React, { useMemo, useRef, useEffect, useState } from 'react'
import { FormattedMessage as T } from 'react-intl'
import { FixedSizeList as List } from 'react-window'
import  AutoSizer from 'react-virtualized-auto-sizer'

import DownloadListBtn from '../DownloadListBtn'
import KnownPageCard from './KnownPageCard'

import { compareUrls } from '../../utils/lru'

const KnownPages = ({
  list,
  tabUrl,
  homepage,
  isPaginating,
  totalPages,
  onDownloadList,
  onSetHomepage,
  onSetTabUrl
}) => {

  const pagesList = useMemo(() => list, [list])
  const listContainer = useRef(null)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    if (listContainer && listContainer.current) {
      const height = window.getComputedStyle(listContainer.current).getPropertyValue('max-height').replace('px', '')
      setContainerHeight(parseInt(height))
    }
  })

  const handleDownloadList = () => {
    onDownloadList('mostLinked')
  }

  const Row = ({ index, style }) => {
    const link = pagesList[index]
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
      <div style={ style }>
        <KnownPageCard
          key={ index }
          isActive={ isActive }
          isHomepage={ isHomepage }
          onClick= { handleSetTabUrl }
          onClickHomepage = { handleSetHomepage }
          innerWidth={ 166 }
          { ...link }
        />
      </div>
    )
  }

  return (
    <div className="known-pages">
      <div className="pages-container" ref={ listContainer }>
        <ul>
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                height={ (pagesList.length * 62 < containerHeight) ? pagesList.length * 62 : containerHeight }
                width={ width }
                itemCount={ pagesList.length }
                itemSize={ 62 } // check stylesheet item height: 50px padding: 6px
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </ul  >
      </div>

      {
        list && list.length > 0 &&
        <div className="button-container">
          {
            isPaginating ?
              <button className="loading-btn">
                <T id="loading" />
                <span> ({list.length}/{totalPages} webpages)</span>
              </button> :
              <DownloadListBtn onClickDownload={ handleDownloadList } />
          }
        </div>
      }
    </div>
  )
}

export default KnownPages