// first login form seen by the user when starting the app

import '../../css/pane'
import '../../css/login/start-up-form'

import React, { PropTypes } from 'react'

import CorpusList from './CorpusList'

const StartUpForm = (props) => {

  // TODO from props
  const servers = [
    {name: 'fooServer', url: 'fooUrl'},
    {name: 'barServer', url: 'barUrl'}
  ]

  return (
    <div className="pane-centered">
      <form className="start-up-form">
        <h2 className="pane-centered-title">Welcome to Hyphe</h2>

        <div className="form-group">
          <select
            className="form-control server-list"
            onChange={ () => this.props.onServerChange() }
          >
            <option>Please select a server instance</option>
            { servers.map((server) =>
              <option key={ server.url }>{ server.name }</option>
            ) }
          </select>
        </div>
        <div className="form-group">
          <button className="btn btn-primary">Add server</button>
        </div>

        <hr />

        <CorpusList />
      </form>
    </div>
  )

}

// TODO add isRequired when implemented
StartUpForm.propTypes = {
  onServerChange: PropTypes.func,
  servers: PropTypes.array
}

export default StartUpForm
