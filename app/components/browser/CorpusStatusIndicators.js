import React from 'react'
import { intlShape } from 'react-intl'

const CorpusStatusIndicators = ({ counters }, { intl: { formatMessage } }) => (
  <div className="corpus-statuses">
    <span className="corpus-status corpus-status-IN" title={ formatMessage({ id: 'corpus-status.IN' }) }>{ counters.IN }</span>
    <span className="corpus-status corpus-status-UNDECIDED" title={ formatMessage({ id: 'corpus-status.UNDECIDED' }) }>{ counters.UNDECIDED }</span>
    <span className="corpus-status corpus-status-OUT" title={ formatMessage({ id: 'corpus-status.OUT' }) }>{ counters.OUT }</span>
    <span className="corpus-status corpus-status-DISCOVERED" title={ formatMessage({ id: 'corpus-status.DISCOVERED' }) }>{ counters.DISCOVERED }</span>
  </div>
)

CorpusStatusIndicators.contextTypes = {
  intl: intlShape
}

export default CorpusStatusIndicators
