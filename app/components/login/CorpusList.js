
import '../../css/login/corpus-list'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { pushPath } from 'redux-simple-router'
import moment from 'moment'

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
      <div>{ corpus.webentities_in } web entities</div>
      <div className="corpus-list-item-dates">
        <span>Created { moment(corpus.created_at).fromNow() }</span>
        <span> - </span>
        <span>Used { moment(corpus.last_activity).fromNow() }</span>
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
      <h3>{ corpora.length } available corpora :</h3>
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
        <Link className="btn btn-primary" to="/login/corpus-form">Create Corpus</Link>
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
