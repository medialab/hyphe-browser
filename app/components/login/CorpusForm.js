// creation form of a corpus

import '../../css/pane'
import '../../css/login/corpus-form'

import React, { PropTypes } from 'react'

export default (props) => {

  return (
    <div className="pane-centered">
      <form className="server-form">
        <h2 className="pane-centered-title">Corpus edition</h2>
        <div className="form-group">
          <label>Corpus name</label>
          <input className="form-control" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="form-control" />
        </div>
        <div className="form-group">
          <label>Confirm password</label>
          <input className="form-control" />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary">Create corpus</button>
          <button className="btn btn-default">Cancel</button>
        </div>
      </form>
    </div>
  )

}


