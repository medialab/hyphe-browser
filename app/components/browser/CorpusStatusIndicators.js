import React, { PropTypes } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { intlShape } from 'react-intl'

class CorpusStatusIndicators extends React.Component {
  render () {
    const { counters } = this.props
    const { formatMessage } = this.context.intl

    return (
      <div className="corpus-statuses">
        <span className="corpus-status corpus-status-IN" title={ formatMessage({ id: 'corpus-status.IN' }) }>{ counters.get('IN') }</span>
        <span className="corpus-status corpus-status-UNDECIDED" title={ formatMessage({ id: 'corpus-status.UNDECIDED' }) }>{ counters.get('UNDECIDED') }</span>
        <span className="corpus-status corpus-status-OUT" title={ formatMessage({ id: 'corpus-status.OUT' }) }>{ counters.get('OUT') }</span>
        <span className="corpus-status corpus-status-DISCOVERED" title={ formatMessage({ id: 'corpus-status.DISCOVERED' }) }>{ counters.get('DISCOVERED') }</span>
      </div>
    )
  }
}

CorpusStatusIndicators.propTypes = {
  counters: ImmutablePropTypes.contains({
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
