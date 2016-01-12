// creation / edition form of a Hyphe server instance

import '../../css/login/server-form'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'

export default (props) => {

  return (
    <form className="server-form">
      <h2 className="pane-centered-title"><T id="server-edition" /></h2>
      <div className="form-group">
        <label><T id="api-url" /></label>
        <input className="form-control" />
      </div>
      <div className="form-group">
        <label><T id="login" /></label>
        <input className="form-control" />
      </div>
      <div className="form-group">
        <label><T id="password" /></label>
        <input className="form-control" />
      </div>
      <div className="form-group">
        <label><T id="instance-name" /></label>
        <input className="form-control" />
      </div>
      <div className="form-actions">
        <button className="btn btn-primary"><T id="save" /></button>
        <Link className="btn btn-default" to="/login"><T id="cancel" /></Link>
      </div>
    </form>
  )

}
