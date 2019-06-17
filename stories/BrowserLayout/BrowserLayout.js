import './BrowserLayout.styl'

import React from 'react'
import cx from 'classnames'

import BrowserBar from '../BrowserBarMock'
import NewTabContent from '../NewTabContent'
import AsideLayout from './AsideLayout'
import BrowserHeader from './BrowserHeader'
import BrowserTabs from './BrowserTabs'

const BrowserLayout = ({
  status,
  isEmpty,
  isLanding
}) => {
  return (
    <div className="browser-layout">
      <BrowserHeader />
      <div className="browser-main-container">
        <AsideLayout { ...{ status, isLanding, isEmpty } } />
        <section className="browser-column browser-main-column">
          <BrowserTabs isEmpty={ isEmpty } />
          <BrowserBar isLanding={ isLanding } displayAddButton={ status === 'in' } />
          {
            isLanding ?
              <NewTabContent isEmpty={ isEmpty } />
              :
              <iframe className="webview" src="https://fr.wikipedia.org/wiki/La_Maison_des_feuilles" />
          }
        </section>
      </div>
    </div>
  )
}

export default BrowserLayout