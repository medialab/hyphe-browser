// login to a corpus form

import '../../css/pane'

import React, { PropTypes } from 'react'

export default (props) => {

  return (
    <div className="pane-centered">
      <form className="server-form">
        <h2 className="pane-centered-title">Login to corpus</h2>
        <div className="form-group">
          <label>Password</label>
          <input className="form-control" />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary">Connect</button>
          <button className="btn btn-default">Cancel</button>
        </div>
      </form>
    </div>
  )

}
