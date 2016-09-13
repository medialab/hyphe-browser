import React, { PropTypes } from 'react'
import { intlShape } from 'react-intl'

class CorpusStatusIndicators extends React.Component {
  render () {
    const { counters } = this.props
    const { formatMessage } = this.context.intl

    return (
      <div className="corpus-statuses">
        <span className="corpus-status corpus-status-UNDECIDED" title={ formatMessage({ id: 'corpus-status.UNDECIDED' }) }>{ counters.UNDECIDED }</span>
        <span className="corpus-status corpus-status-IN" title={ formatMessage({ id: 'corpus-status.IN' }) }>{ counters.IN }</span>
        <span className="corpus-status corpus-status-IN_UNTAGGED" title={ formatMessage({ id: 'corpus-status.IN_UNTAGGED' }) }>{ counters.IN_UNTAGGED }</span>
        <span className="corpus-status corpus-status-IN_UNCRAWLED" title={ formatMessage({ id: 'corpus-status.IN_UNCRAWLED' }) }>{ counters.IN_UNCRAWLED }</span>
        <span className="corpus-status corpus-status-OUT" title={ formatMessage({ id: 'corpus-status.OUT' }) }>{ counters.OUT }</span>
        <span className="corpus-status corpus-status-DISCOVERED" title={ formatMessage({ id: 'corpus-status.DISCOVERED' }) }>{ counters.DISCOVERED }</span>
      </div>
    )
  }
}

CorpusStatusIndicators.propTypes = {
  counters: PropTypes.shape({
    UNDECIDED: PropTypes.number.isRequired,
    IN: PropTypes.number.isRequired,
    IN_UNTAGGED: PropTypes.number.isRequired,
    IN_UNCRAWLED: PropTypes.number.isRequired,
    OUT: PropTypes.number.isRequired,
    DISCOVERED: PropTypes.number.isRequired
  }).isRequired
}

CorpusStatusIndicators.contextTypes = {
  intl: intlShape
}

export default CorpusStatusIndicators
