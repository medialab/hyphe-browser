import '../../css/login/corpus-list'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'

const CorpusList = (props) => {

  const corpora = Object.keys(props.corpora).map((k) => props.corpora[k])

  return (
    <div>
      <h3>Available corpora :</h3>
      <div className="corpus-list-slider">
        <ul className="list-group corpus-list">
          { corpora.map((corpus) =>
            <li className="list-group-item" key={ corpus.corpus_id }>
              <Link to="/login/corpus-login-form">{ corpus.name }</Link>
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
