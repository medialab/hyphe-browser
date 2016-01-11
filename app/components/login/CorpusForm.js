// creation form of a corpus

import '../../css/login/corpus-form'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'

export default (props) => {

  return (
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
        <Link className="btn btn-default" to="/login">Cancel</Link>
      </div>
    </form>
  )

}


