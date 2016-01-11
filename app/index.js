import React from 'react'
import { render } from 'react-dom'
import Root from './components/Root'
import configureStore from './store/configureStore'
import { Provider } from 'react-redux'

const store = configureStore()

const domRoot = document.getElementById('root')

const rootElement = <Provider store={ store }><Root /></Provider>

render(rootElement, domRoot)
