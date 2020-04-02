import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage as T, FormattedRelativeTime as D, useIntl } from 'react-intl'
import { selectUnit } from '@formatjs/intl-utils'

const CorpusCard = ({
  server, 
  corpus, 
  selectCorpus, 
  routerPush
}) => {
  const { formatMessage } = useIntl()
  const { password, name, status, webentities_in, created_at, last_activity } = corpus
  const handleSelectCorpus = () => {
    const path = corpus.password ? '/login/corpus-login-form' : 'browser'
    selectCorpus(server, corpus)
    routerPush(path)
  }
  
  return (
    <li className="corpus-card" onClick={ handleSelectCorpus }>
      <h2 className="corpus-name">
        { name }
        { password && <span className="info-icon hint--right" aria-label={ formatMessage({ id: 'password-protected' }) }><i className="ti-lock" /></span> }
        { status === 'ready' && <span className="info-icon hint--right" aria-label={ formatMessage({ id: 'running' }) }><i className="ti-control-play" /></span> }
      </h2>
      <div className="corpus-webentities"><T id="webentities" values={ { count: webentities_in } } /></div>
      <div className="corpus-dates">
        <span>
          <T
            id="created-ago"
            values={ { relative: <D { ...selectUnit(created_at) } numeric='auto' style='long' /> } }
          />
        </span>
        <span> - </span>
        <span><T id="used-ago" values={ { relative: <D  { ...selectUnit(last_activity) } /> } } /></span>
      </div>
    </li>
  )
}

CorpusCard.propTypes = {
  corpus: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func
  }),

  // actions
  selectCorpus: PropTypes.func,
}



export default CorpusCard