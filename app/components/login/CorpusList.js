
import '../../css/login/corpus-list'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { pushPath } from 'redux-simple-router'
import { FormattedMessage as T, FormattedRelative as D } from 'react-intl'

// abstract component
const CorpusListItem = (props) => {

  const { actions, corpus, dispatch } = props
  const path = corpus.password ? '/login/corpus-login-form' : 'browser'

  return (
    <div onClick={ () => { actions.selectCorpus(props.corpus); dispatch(pushPath(path)) } }>
      <h5 className="corpus-list-item-name">
        { corpus.password ? <span className="icon icon-lock"></span> : null }
        { corpus.name }
        { corpus.status === 'ready' ? <span className="icon icon-play"></span> : null }
      </h5>
      <div><T id="webentities" values={ { count: corpus.webentities_in } } /></div>
      <div className="corpus-list-item-dates">
        <span><T id="created-ago" values={ { relative: <D value={ corpus.created_at } /> } } /></span>
        <span> - </span>
        <span><T id="used-ago" values={ { relative: <D value={ corpus.last_activity } /> } } /></span>
      </div>
    </div>
  )
}
CorpusListItem.propTypes = {
  actions: PropTypes.object.isRequired,
  corpus: PropTypes.object.isRequired,
  dispatch: PropTypes.func
}

const CorpusList = (props) => {

  const { actions, dispatch } = props
  const corpora = Object.keys(props.corpora)
    .sort()
    .map((k) => props.corpora[k])

  if (!corpora.length) return <noscript />

  return (
    <div>
      <h3><T id="available-corpora" values={ { count: corpora.length } } /></h3>
      <div className="form-group corpus-list-slider">
        <ul className="list-group corpus-list">
          { corpora.map((corpus) =>
            <li className="list-group-item corpus-list-item" key={ corpus.corpus_id }>
              <CorpusListItem actions={ actions } corpus={ corpus } dispatch={ dispatch } />
            </li>
          ) }
        </ul>
      </div>
      <div className="form-actions">
        <Link className="btn btn-primary" to="/login/corpus-form"><T id="create-corpus" /></Link>
      </div>
    </div>
  )
}

CorpusList.propTypes = {
  actions: PropTypes.object.isRequired,
  corpora: PropTypes.object.isRequired,
  dispatch: PropTypes.func
}

export default CorpusList
