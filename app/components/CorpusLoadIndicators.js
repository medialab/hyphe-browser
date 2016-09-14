
import './../css/corpus-load-indicators'

import React, { PropTypes } from 'react'
import { intlShape } from 'react-intl'

import { getCorpusCrawlingStatus, getHypheCrawlingStatus } from '../utils/status'

class CorpusLoadIndicators extends React.Component {
  render () {
    const { status } = this.props
    const { intl: { formatMessage } } = this.context

    const corpusCrawlingStatus = getCorpusCrawlingStatus(status.corpus.crawler)
    // TODO max_crawls configurable
    const hypheCrawlingStatus = getHypheCrawlingStatus({ max_crawls: 12, ...status.hyphe })

    return (
      <span className="corpus-load-indicators">
        <span className="corpus-load-title">Hyphe</span>
        <span title={ formatMessage({ id: 'corpus-load-status' }, { status: formatMessage({ id: 'corpus-load-status.' + corpusCrawlingStatus }) }) }>
          <span className={ 'corpus-load corpus-load-status-' + corpusCrawlingStatus } />
        </span>
        <span title={ formatMessage({ id: 'corpus-load-pending' }) }>
          { status.corpus.crawler.jobs_pending }
        </span>
        <span title={ formatMessage({ id: 'corpus-load-running' }) }>
          { status.corpus.crawler.jobs_running }
        </span>
        <span title={ formatMessage({ id: 'corpus-load-health' }, { status: formatMessage({ id: 'corpus-load-health.' + hypheCrawlingStatus }) }) }>
          <span className={ 'corpus-load corpus-load-health-' + hypheCrawlingStatus } />
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
