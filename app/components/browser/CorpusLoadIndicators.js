import React from 'react'
import { corpusStatusShape } from '../../types'
import { MAX_HYPHE_CRAWLS } from '../../constants'
import { getCorpusCrawlingStatus, getHypheCrawlingStatus } from '../../utils/status'
import { intlShape } from 'react-intl'

class CorpusLoadIndicators extends React.Component {
  render () {
    const { status } = this.props

    if (!status) {
      // Not ready
      return <noscript />
    }

    const { intl: { formatMessage } } = this.context

    const corpusCrawlingStatus = getCorpusCrawlingStatus(status.getIn(['corpus', 'crawler']))
    const hypheCrawlingStatus = getHypheCrawlingStatus(status.get('hyphe').set('max_crawls', MAX_HYPHE_CRAWLS).toObject())

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
          { status.getIn(['corpus', 'crawler', 'jobs_pending']) }
        </span>
        <span className="corpus-load corpus-load-running" title={ formatMessage({ id: 'corpus-load-running' }) }>
          { status.getIn(['corpus', 'crawler', 'jobs_running']) }
        </span>
        <span className="corpus-load corpus-load-health" title={ formatMessage({ id: 'corpus-load-health' }, { status: formatMessage({ id: 'corpus-load-health.' + hypheCrawlingStatus }) }) }>
          <span className={ 'corpus-load-health-' + hypheCrawlingStatus + ' icon icon-' + loadHealthIcon } />
        </span>
      </div>
    )
  }
}

CorpusLoadIndicators.propTypes = {
  status: corpusStatusShape
}

CorpusLoadIndicators.contextTypes = {
  intl: intlShape
}

export default CorpusLoadIndicators
