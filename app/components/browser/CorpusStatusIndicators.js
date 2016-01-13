import React, { PropTypes } from 'react'
import { intlShape } from 'react-intl'

class CorpusStatusIndicators extends React.Component {
  render () {
    const { counters } = this.props
    const { intl: { formatMessage } } = this.context

    return (
      <div className="corpus-statuses">
        <span className="corpus-status corpus-status-IN" title={ formatMessage({ id: 'corpus-status.IN' }) }>{ counters.IN }</span>
        <span className="corpus-status corpus-status-UNDECIDED" title={ formatMessage({ id: 'corpus-status.UNDECIDED' }) }>{ counters.UNDECIDED }</span>
        <span className="corpus-status corpus-status-OUT" title={ formatMessage({ id: 'corpus-status.OUT' }) }>{ counters.OUT }</span>
        <span className="corpus-status corpus-status-DISCOVERED" title={ formatMessage({ id: 'corpus-status.DISCOVERED' }) }>{ counters.DISCOVERED }</span>
      </div>
    )
  }
}

CorpusStatusIndicators.propTypes = {
  counters: PropTypes.shape({
    IN: PropTypes.number.isRequired,
    UNDECIDED: PropTypes.number.isRequired,
    OUT: PropTypes.number.isRequired,
    DISCOVERED: PropTypes.number.isRequired
  }).isRequired
}

CorpusStatusIndicators.contextTypes = {
  intl: intlShape
}

export default CorpusStatusIndicators
