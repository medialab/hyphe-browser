import React from 'react'
import { getCorpusCrawlingStatus, getHypheCrawlingStatus } from '../../utils/status'

/*
  corpus.crawler.jobs_pending = nb de crawls prévus
  corpus.crawler.jobs_running = nb de crawls en cours
  corpus.memory_structure.pages_to_index = nb de pages à indexer
  hyphe.crawls_pending = nb de crawls sur la plateforme
  crawl_slots = max_crawls (config ?) - hyphe.crawls_running
*/

export default ({ status }) => {
  const corpusCrawlingStatus = getCorpusCrawlingStatus(status.corpus.crawler)
  // TODO max_crawls configurable
  const hypheCrawlingStatus = getHypheCrawlingStatus({ max_crawls: 12, ...status.hyphe })

  const loadStatusIcon = {
    READY: 'check',
    PENDING: 'hourglass',
    CRAWLING: 'arrows-ccw'
  }[corpusCrawlingStatus]

  const loadHealthIcon = {
    OK: 'check',
    PENDING: 'hourglass',
    ERROR: 'alert'
  }[hypheCrawlingStatus]

  return (
    <div className="corpus-loads">
      <span className="corpus-load corpus-load-status" title={ 'Corpus load: ' + corpusCrawlingStatus }>
        <span className={ 'corpus-load-status-' + corpusCrawlingStatus + ' icon icon-' + loadStatusIcon } />
      </span>
      <span className="corpus-load corpus-load-pending" title={ 'Pending jobs' }>
        { status.corpus.crawler.jobs_pending }
      </span>
      <span className="corpus-load corpus-load-index" title={ 'Running jobs' }>
        { status.corpus.crawler.jobs_running }
      </span>
      <span className="corpus-load corpus-load-health" title={ 'Crawlers health: ' + hypheCrawlingStatus }>
        <span className={ 'corpus-load-health-' + hypheCrawlingStatus + ' icon icon-' + loadHealthIcon } />        
      </span>
    </div>
  )
}
