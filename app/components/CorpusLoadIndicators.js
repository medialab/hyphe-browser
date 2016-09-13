import React, { PropTypes } from 'react'
import { getCorpusCrawlingStatus, getHypheCrawlingStatus } from '../utils/status'
import { intlShape } from 'react-intl'

class CorpusLoadIndicators extends React.Component {
  render () {
    const { status } = this.props
    const { intl: { formatMessage } } = this.context

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
      <span className="corpus-loads">
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
      </span>
    )
  }
}

CorpusLoadIndicators.propTypes = {
  status: PropTypes.shape({
    corpus: PropTypes.shape({
      crawler:  PropTypes.shape({
        jobs_pending: PropTypes.number.isRequired,
        jobs_running: PropTypes.number.isRequired
      }).isRequired
    }).isRequired,
    hyphe: PropTypes.shape({
      crawls_pending: PropTypes.number.isRequired,
      crawls_running: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
}

CorpusLoadIndicators.contextTypes = {
  intl: intlShape
}

export default CorpusLoadIndicators
