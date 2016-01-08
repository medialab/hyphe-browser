import React from 'react'
import { render } from 'react-dom'
import App from './components/App'

const domRoot = document.getElementById('root')

const rootElement = <App />

render(rootElement, domRoot)
