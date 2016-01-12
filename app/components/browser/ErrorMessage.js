import React from 'react'

export default ({ message, icon, fatal }) => (
  <div className={ 'error-dialog-wrapper ' + (fatal ? 'blocking' : '') }>
    <div className={ 'error-dialog ' + (message ? 'visible' : 'hidden') }>
      { icon ? <span class={ 'icon icon-' + icon } /> : null }
      <strong> { message }</strong>
    </div>
  </div>
)
