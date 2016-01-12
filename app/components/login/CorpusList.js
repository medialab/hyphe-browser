// 4 components in this file
//
// this list displays 2 kind of items:
// - password protected corpora redirect to /login/corpus-login-form
// - no password protected corpora change the state and redirect to /browser

import '../../css/login/corpus-list'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import moment from 'moment'

// abstract component
const CorpusListItem = (props) => {
  const { corpus } = props

  return (
    <div>
      <h5 className="corpus-list-item-name">
        { corpus.password ? <span className="icon icon-lock"></span> : null }
        { corpus.name }
        { corpus.status === "ready" ? <span className="icon icon-play"></span> : null }
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
  corpus: PropTypes.object.isRequired
}


const PasswordCorpusListItem = (props) => {

  return (
    <Link to="/login/corpus-login-form">
      <CorpusListItem corpus={ props.corpus } />
    </Link>
  )
}

PasswordCorpusListItem.propTypes = {
  corpus: PropTypes.object.isRequired
}


const NoPasswordCorpusListItem = (props) => {

  return (
    <div onClick={ () => props.actions.selectCorpus(props.corpus) }>
      <CorpusListItem corpus={ props.corpus } />
    </div>
  )
}

NoPasswordCorpusListItem.propTypes = {
  actions: PropTypes.object.isRequired,
  corpus: PropTypes.object.isRequired
}


const CorpusList = (props) => {

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
              { corpus.password
                ? <PasswordCorpusListItem corpus={ corpus } />
                : <NoPasswordCorpusListItem actions={ props.actions } corpus={ corpus } />
              }
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
  corpora: PropTypes.object.isRequired
}

export default CorpusList
