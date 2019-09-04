import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage as T, FormattedRelative as D, intlShape } from 'react-intl'

const CorpusCard = ({
  server, 
  corpus, 
  selectCorpus, 
  routerPush
}) => {
  const { password, name, status, webentities_in, created_at, last_activity } = corpus
  const handleSelectCorpus = () => {
    const path = corpus.password ? '/login/corpus-login-form' : 'browser'
    selectCorpus(server, corpus)
    routerPush(path)
  }
  return (
    <li className="corpus-card" onClick={ handleSelectCorpus }>
      <h2 className="corpus-name">
        { password && <span className="icon icon-lock" /> }
        { name }
        { status === 'ready' && <span className="icon icon-play" /> }
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



export default CorpusCard;