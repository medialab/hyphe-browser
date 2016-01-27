export const getCorpusCrawlingStatus = ({ jobs_pending, jobs_running }) => (
  (jobs_pending === 0 && jobs_running === 0)
  ? 'READY'
  : ((jobs_running === 0) // && jobs_pending > 0
    ? 'PENDING'
    : 'CRAWLING'
  )
)

export const getHypheCrawlingStatus = ({ crawls_pending, crawls_running, max_crawls }) => {
  const crawl_slots = max_crawls - crawls_running
  return (crawls_pending === 0)
    ? 'OK'
    : ((crawl_slots === 0)
      ? 'PENDING'
      : 'ERROR'
    )
}

export const getWebEntityActivityStatus = ({ crawling_status, indexing_status }) => ({
  UNCRAWLED: {
    UNINDEXED: 'UNCRAWLED'
  },
  PENDING: {
    UNINDEXED: 'PENDING',
    PENDING: 'PENDING'
  },
  RETRIED: {
    UNINDEXED: 'PENDING',
    PENDING: 'PENDING',
    BATCH_RUNNING: 'RUNNING',
    BATCH_FINISHED: 'RUNNING',
    BATCH_CRASHED: 'RUNNING'
  },
  RUNNING: {
    UNINDEXED: 'RUNNING',
    PENDING: 'RUNNING',
    BATCH_RUNNING: 'RUNNING',
    BATCH_FINISHED: 'RUNNING',
    BATCH_CRASHED: 'RUNNING'
  },
  FINISHED: {
    UNINDEXED: 'RUNNING',
    PENDING: 'RUNNING',
    BATCH_RUNNING: 'RUNNING',
    BATCH_FINISHED: 'RUNNING',
    BATCH_CRASHED: 'RUNNING',
    FINISHED: 'CRAWLED'
  },
  CANCELED: {
    UNINDEXED: 'UNCRAWLED',
    PENDING: 'UNCRAWLED',
    BATCH_RUNNING: 'UNCRAWLED',
    BATCH_FINISHED: 'UNCRAWLED',
    BATCH_CRASHED: 'UNCRAWLED',
    FINISHED: 'UNCRAWLED'
  }
}[crawling_status][indexing_status] || 'ERROR')
