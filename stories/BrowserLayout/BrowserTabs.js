import React from 'react'


const BrowserTabs = ({
  isEmpty
}) => {
  return (
    <div className="browser-tabs">
      <div className="browser-tab-label active" title="La maison des feuilles | Wikipedia">
        {!isEmpty && <object data="https://wikipedia.org/static/favicon/wikipedia.ico" width="16" height="16" className="browser-tab-favicon" />}
        <span className="browser-tab-title">{isEmpty ? 'New tab' : 'La Maison des Feuilles - Wikipedia'}</span>
      </div>
      <div className="browser-tab-new" title="Open new tab" />
    </div>
  )
}

export default BrowserTabs