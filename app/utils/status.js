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
