import React from 'react'


import HeaderMetrics from './HeaderMetrics'
const BrowserHeader = () => {
  return (
    <div className="browser-header">
      <div className="header-group header-group-main">
        <h1>My inquiry <i aria-label="server is ok" className="server-status hint--right" /></h1>
        <HeaderMetrics />
      </div>
      <div className="header-group header-group-aside">
        <ul className="header-buttons">
          <li><button className="btn is-active">browse & review</button></li>
          <li><button className="btn">visualize in hyphe</button></li>
          <li><button aria-label="close corpus" className="btn hint--left"><i className="ti-close" /></button></li>
        </ul>
      </div>
    </div>
  )
}
export default BrowserHeader