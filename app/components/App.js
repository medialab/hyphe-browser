import React from 'react'
import LoginPage from './LoginPage'
import HypheBrowser from './HypheBrowser'

export default class App extends React.Component {

  renderLoginPage () {
    return <LoginPage />
  }

  renderHypheBrowser () {
    return <HypheBrowser />
  }

  render () {
    const corpusSelected = false // TODO login screen
    if (corpusSelected) {
      return this.renderHypheBrowser()
    } else {
      return this.renderLoginPage()
    }
  }

}
