import '../../css/login/corpus-list'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import moment from 'moment'

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
              <Link to="/login/corpus-login-form">
                <h5 className="corpus-list-item-name">
                  { corpus.password ? <span className="icon icon-lock"></span> : null }
                  { corpus.name }
                </h5>
                <div>{ corpus.webentities_in } web entities</div>
                <div className="corpus-list-item-dates">
                  <span>Created { moment(corpus.created_at).fromNow() }</span>
                  <span> - </span>
                  <span>Used { moment(corpus.last_activity).fromNow()  }</span>
                </div>
              </Link>
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
  corpora: PropTypes.object.isRequired
}

export default CorpusList
