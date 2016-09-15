import React from 'react'
import { Route, IndexRoute, IndexRedirect } from 'react-router'

import App from './components/App'
import Browser from './components/browser/Browser'

// login components
import Login from './components/login/Login'
import CorpusForm from './components/login/CorpusForm'
import CorpusList from './components/login/CorpusList'
import CorpusLoginForm from './components/login/CorpusLoginForm'
import ServerForm from './components/login/ServerForm'
import Options from './components/login/Options'
import Lobby from './components/login/Lobby'

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
      // change language, reset server list…
      <Route path="options" component={ Options } />
      // waiting room while corpus's starting
      <Route path="lobby" component={ Lobby } />
      // select a server, a corpus and login to the latter
      <IndexRoute component={ CorpusList } />
    </Route>

    <Route path="browser" component={ Browser } />

    <IndexRedirect to="/login" />
  </Route>
)
