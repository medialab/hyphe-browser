import React from 'react'
import { render } from 'react-dom'
import DumbButton from './components/DumbButton'

const domRoot = document.getElementById('root')

const rootElement = <DumbButton />

render(rootElement, domRoot)
