// login to a corpus form

import React, { PropTypes } from 'react'
import { Link } from 'react-router'

export default (props) => {

  return (
    <form className="server-form">
      <h2 className="pane-centered-title">Login to corpus</h2>
      <div className="form-group">
        <label>Password</label>
        <input className="form-control" />
      </div>
      <div className="form-actions">
        <Link className="btn btn-primary" to="/browser">Connect</Link>
        <Link className="btn btn-default" to="/login">Cancel</Link>
      </div>
    </form>
  )

}
