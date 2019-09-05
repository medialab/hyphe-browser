import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage as T, FormattedRelative as D, intlShape } from 'react-intl'

const CorpusCard = ({
  server, 
  corpus, 
  selectCorpus, 
  routerPush
}, {intl: {formatMessage}}) => {
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
        { password && <span className="info-icon hint--right" aria-label={formatMessage({id: 'password-protected'})}><i className="ti-lock"/></span> }
        { status === 'ready' && <span className="info-icon hint--right" aria-label={formatMessage({id: 'running'})}><i className="ti-play"/></span> }
      </h2>
      <div className="corpus-webentities"><T id="webentities" values={ { count: webentities_in } } /></div>
      <div className="corpus-dates">
        <span><T id="created-ago" values={ { relative: <D value={ created_at } /> } } /></span>
        <span> - </span>
        <span><T id="used-ago" values={ { relative: <D value={ last_activity } /> } } /></span>
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

CorpusCard.contextTypes = {
  intl: PropTypes.object,
}



export default CorpusCard;