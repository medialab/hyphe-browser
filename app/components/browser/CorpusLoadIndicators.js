import React from 'react'
import { getCorpusCrawlingStatus, getHypheCrawlingStatus } from '../../utils/status'
import { intlShape } from 'react-intl'

const CorpusLoadIndicators = ({ status }, { intl: { formatMessage } }) => {
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
      <span className="corpus-load corpus-load-status" title={ formatMessage({ id: 'corpus-load-status' }, { status: formatMessage({ id: 'corpus-load-status.' + corpusCrawlingStatus }) }) }>
        <span className={ 'corpus-load-status-' + corpusCrawlingStatus + ' icon icon-' + loadStatusIcon } />
      </span>
      <span className="corpus-load corpus-load-pending" title={ formatMessage({ id: 'corpus-load-pending' }) }>
        { status.corpus.crawler.jobs_pending }
      </span>
      <span className="corpus-load corpus-load-running" title={ formatMessage({ id: 'corpus-load-running' }) }>
        { status.corpus.crawler.jobs_running }
      </span>
      <span className="corpus-load corpus-load-health" title={ formatMessage({ id: 'corpus-load-health' }, { status: formatMessage({ id: 'corpus-load-health.' + hypheCrawlingStatus }) }) }>
        <span className={ 'corpus-load-health-' + hypheCrawlingStatus + ' icon icon-' + loadHealthIcon } />
      </span>
    </div>
  )
}

CorpusLoadIndicators.contextTypes = {
  intl: intlShape
}

export default CorpusLoadIndicators
