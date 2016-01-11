import React, { PropTypes } from 'react'
import { Link } from 'react-router'

export default (props) => {

  const corpora = [
    {name: 'qux'},
    {name: 'tolkien'},
    {name: 'asimov'}
  ]

  return (
    <div>
      <h3>Available corpora :</h3>
      <ul className="list-group corpus-list">
        { corpora.map((corpus) =>
          <li className="list-group-item" key={ corpus.name }>
            <Link to="/login/corpus-login-form">{ corpus.name }</Link>
          </li>
        ) }
      </ul>
      <div className="form-actions">
        <Link className="btn btn-primary" to="/login/corpus-form">Create Corpus</Link>
      </div>
    </div>
  )
}
