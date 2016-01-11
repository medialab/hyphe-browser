// creation / edition form of a Hyphe server instance

import '../../css/pane'
import '../../css/login/server-form'

import React, { PropTypes } from 'react'

export default (props) => {

  return (
    <div className="pane-centered">
      <form className="server-form">
        <h2 className="pane-centered-title">Server edition</h2>
        <div className="form-group">
          <label>API url</label>
          <input className="form-control" />
        </div>
        <div className="form-group">
          <label>Login</label>
          <input className="form-control" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="form-control" />
        </div>
        <div className="form-group">
          <label>Instance name</label>
          <input className="form-control" />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary">Save</button>
          <button className="btn btn-default">Cancel</button>
        </div>
      </form>
    </div>
  )

}

