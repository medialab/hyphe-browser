import React from 'react'
import { Route, Redirect, Switch } from 'react-router'

// import Browser from './containers/Browser'
import BrowserContainer from './containers/BrowserContainer'
// login components
import Login from './containers/Login/Login'
import CorpusForm from './containers/Login/CorpusForm'
import CorpusList from './containers/Login/CorpusList'
import CorpusLoginForm from './containers/Login/CorpusLoginForm'
import ServerForm from './containers/Login/ServerForm'

export default () => (
  <Switch>
    <Route
      path="/login" component={ (props) => (
        <Login { ...props }>
          <Switch>
            <Route exact path="/login/corpus-form" component={ CorpusForm } />

            <Route exact path="/login/corpus-login-form" component={ CorpusLoginForm } />

            <Route exact path="/login/server-form" component={ ServerForm } />

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

// export default () => (
//   <Route path="/" component={ App }>
//     {/*// only display the servers dropdowns
//     <Route path="login" component={ Login }>
//       // create a new corpus
//       <Route path="corpus-form" component={ CorpusForm } />
//       // connect to a password protected corpus
//       <Route path="corpus-login-form" component={ CorpusLoginForm } />
//       // create / edit a Hyphe server
//       <Route path="server-form" component={ ServerForm } />
//       // select a server, a corpus and login to the later
//       <Route path="/" component={ CorpusList } />
//     </Route>

//     <Route path="browser" component={ Browser } />

//     <Redirect to="/login" />*/}
//   </Route>
// )
