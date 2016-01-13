import React from 'react'

const BrowserTab = ({ active, id, title, icon, loading, selectTab, closeTab }) => (
  <div key={ id } className={ 'browser-tab tab-item ' + (active ? ' active' : '') } onClick={ () => selectTab(id) }>
    <span className="icon icon-cancel icon-close-tab" onClick={ (e) => { e.stopPropagation(); closeTab(id) } }></span>
    { loading
      ? <span className="icon icon-dot-3" /> // TODO loading icon in tab
      : (icon ? <img src={ icon } width="16" height="16" className="tab-favicon" /> : null)
    }
    { title }
  </div>
)

export default BrowserTab
