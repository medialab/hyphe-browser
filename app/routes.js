import React from 'react'
import { Route, Redirect, Switch } from 'react-router'

import BrowserContainer from './containers/BrowserContainer'
// login components
import Login from './containers/Login/Login'
import CorpusForm from './containers/Login/CorpusForm'
import CorpusList from './containers/Login/CorpusList'
import CorpusLoginForm from './containers/Login/CorpusLoginForm'
import ServerForm from './containers/Login/ServerForm'
import CreateServerForm from './containers/Login/CreateServerForm'

export default () => (
  <Switch>
    <Route
      path="/login" component={ (props) => (
        <Login { ...props }>
          <Switch>
            <Route exact path="/login/corpus-form" component={ CorpusForm } />

            <Route exact path="/login/corpus-login-form" component={ CorpusLoginForm } />

            <Route exact path="/login/server-form" component={ ServerForm } />

            <Route exact path="/login/create-form" component={ CreateServerForm } />

            <Route path="/" component={ CorpusList } />
          </Switch>
        </Login>
      ) }
    />

    <Route exact path="/browser" component={ BrowserContainer } />

    <Redirect from="*" to="/login" />

  </Switch>
)

if (module.hot) {
  module.hot.accept()
}
