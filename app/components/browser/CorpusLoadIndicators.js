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

  return (
    <div className="corpus-loads">
      <span className="corpus-load corpus-load-status">{ corpusCrawlingStatus }</span>
      <span className="corpus-load corpus-load-pending">{ status.corpus.crawler.jobs_pending }</span>
      <span className="corpus-load corpus-load-index">{ status.corpus.crawler.jobs_running }</span>
      <span className="corpus-load corpus-load-health">{ hypheCrawlingStatus }</span>
    </div>
  )
}
