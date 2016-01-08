import React from 'react'

export default class App extends React.Component {

  render () {
    return (
      <div className="window">
        <div className="window-content">
          <div className="pane-group">
            <div className="pane pane-one-third sidebar">
              <ul className="list-group">
                <li className="list-group-header">
                  <h2>Select instance <span className="icon icon-plus-circled"></span></h2>
                  <input className="form-control" type="text" placeholder="Filter" />
                </li>
                <li className="list-group-item active">
                  <span className="pull pull-right icon icon-pencil" />
                  <strong>Démo</strong>
                </li>
                <li className="list-group-item">
                  <span className="pull pull-right icon icon-pencil" />
                  <strong>Instance N°1</strong>
                </li>
                <li className="list-group-item">
                  <span className="pull pull-right icon icon-pencil" />
                  <strong>DEV</strong>
                </li>
              </ul>
            </div>
            <div className="pane pane-one-third sidebar">
              <ul className="list-group">
                <li className="list-group-header">
                  <h2>Select corpus <span className="icon icon-plus-circled"></span></h2>
                  <input className="form-control" type="text" placeholder="Filter" />
                </li>
                <li className="list-group-item active">
                  <strong>Tolkien</strong>
                </li>
                <li className="list-group-item">
                  <strong>List item title</strong>
                </li>
              </ul>
            </div>
            <div className="pane pane-one-third sidebar">
              <ul className="list-group">
                <li className="list-group-header">
                  <h2>Connect to corpus</h2>
                </li>
              </ul>
              <form>
                <div className="form-group">
                  <label>Login</label>
                  <input type="email" className="form-control" placeholder="Email" />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="form-control" placeholder="Password" />
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-form btn-primary">Connection</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

}
