import React from 'react'
import { Route, IndexRoute, IndexRedirect } from 'react-router'

import App from './components/App'
import HypheBrowser from './components/HypheBrowser'

// login components
import Login from './components/login/Login'
import CorpusForm from './components/login/CorpusForm'
import CorpusLoginForm from './components/login/CorpusLoginForm'
import ServerForm from './components/login/ServerForm'
import StartUpForm from './components/login/StartUpForm'

export default (
  <Route path="/" component={ App }>

    <Route path="login" component={ Login }>
      <Route path="corpus-form" component= { CorpusForm } />
      <Route path="corpus-login-form" component= { CorpusLoginForm } />
      <Route path="server-form" component= { ServerForm } />
      // select a server, a corpus and login to the latter
      <IndexRoute component={ StartUpForm } />
    </Route>

    <Route path="browser" component={ HypheBrowser } />

    <IndexRedirect to="/login" />
  </Route>
)
