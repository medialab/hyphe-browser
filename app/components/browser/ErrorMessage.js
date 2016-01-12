import React from 'react'

export default ({ message, icon }) => (
  <div className={ 'error-dialog ' + (message ? 'visible' : 'hidden') }>
    { icon ? <span class={ 'icon icon-' + icon } /> : null }
    <strong> { message }</strong>
  </div>
)
