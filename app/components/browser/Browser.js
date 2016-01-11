import React from 'react'
import ErrorMessage from './ErrorMessage'
import Header from './Header'
import BrowserStack from './BrowserStack'
import BrowserTabs from './BrowserTabs'

export default () => (
  <div className="window">
    <ErrorMessage message={ null } />
    <Header uri="http://hyphe.medialab.sciences-po.fr/dev-forccast-api" corpus="test" />
    <BrowserStack />
    <BrowserTabs />
  </div>
)
