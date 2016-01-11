import React from 'react'
import StartUpForm from './login/StartUpForm'
import HypheBrowser from './HypheBrowser'

export default class App extends React.Component {

  // select a server, a corpus and login to the latter
  renderStartUpForm () {
    return <StartUpForm />
  }

  renderHypheBrowser () {
    return <HypheBrowser />
  }

  render () {
    const corpusSelected = false // TODO login screen

    return (
      <div className="window">
        <div className="window-content">
          { corpusSelected
            ? this.renderHypheBrowser()
            : this.renderStartUpForm()
          }
        </div>
      </div>

    )
  }

}
