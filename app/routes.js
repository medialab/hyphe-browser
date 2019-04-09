import React from 'react'
import { Route, IndexRoute, IndexRedirect } from 'react-router'

import App from './containers/App'
import Browser from './containers/browser/Browser'

// login components
import Login from './containers/login/Login'
import CorpusForm from './containers/login/CorpusForm'
import CorpusList from './containers/login/CorpusList'
import CorpusLoginForm from './containers/login/CorpusLoginForm'
import ServerForm from './containers/login/ServerForm'
import Lobby from './containers/login/Lobby'

export default (
  <Route path="/" component={ App }>

    // only display the servers dropdown
    <Route path="login" component={ Login }>
      // create a new corpus
      <Route path="corpus-form" component={ CorpusForm } />
      // connect to a password protected corpus
      <Route path="corpus-login-form" component={ CorpusLoginForm } />
      // create / edit a Hyphe server
      <Route path="server-form" component={ ServerForm } />
      // waiting room while corpus's starting
      <Route path="lobby" component={ Lobby } />
      // select a server, a corpus and login to the later
      <IndexRoute component={ CorpusList } />
    </Route>

    <Route path="browser" component={ Browser } />

    <IndexRedirect to="/login" />
  </Route>
)
