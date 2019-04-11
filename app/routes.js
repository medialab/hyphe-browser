import React from 'react'
import { Route, IndexRoute, IndexRedirect } from 'react-router'

import App from './containers/App'
import Browser from './containers/Browser'

// login components
import Login from './containers/Login/Login'
import CorpusForm from './containers/Login/CorpusForm'
import CorpusList from './containers/Login/CorpusList'
import CorpusLoginForm from './containers/Login/CorpusLoginForm'
import ServerForm from './containers/Login/ServerForm'

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
      // select a server, a corpus and login to the later
      <IndexRoute component={ CorpusList } />
    </Route>

    <Route path="browser" component={ Browser } />

    <IndexRedirect to="/login" />
  </Route>
)
