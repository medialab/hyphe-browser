import './SplashScreen.styl'
import React from 'react'

import LogoTitle from '../LogoTitle'

const SplashScreen = ({}) => {
  return (
    <div className="splash-screen">
      <div className="splash-screen-container">
            <div className="splash-screen-content">
              <LogoTitle />
              <div className="loading-container">
                  Loading the app<span>.</span><span>.</span><span>.</span>
              </div>
            </div>
        </div>
    </div>
  )
}

export default SplashScreen