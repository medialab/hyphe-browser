import React from 'react'
import App from './App'
import DevTools from '../components/DevTools' // make it NODE_ENV-dependent

export default class Root extends React.Component {
  render () {
    return (
      <div>
        <App />
        { devTools() }
      </div>
    )
  }
}

function devTools () {
  if (process.env.NODE_ENV === 'development') {
    return DevTools
  } else {
    return null
  }
}
