import React, { PropTypes } from 'react'

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
            <strong>{ corpus.name }</strong>
          </li>
        ) }
      </ul>
      <div className="form-actions">
        <button className="btn btn-primary">Create corpus</button>
      </div>
    </div>
  )
}
