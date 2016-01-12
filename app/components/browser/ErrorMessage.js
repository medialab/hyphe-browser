import React from 'react'

export default ({ message }) => (
  <div className={ 'error-dialog ' + (message ? 'visible' : 'hidden') }>
    <strong>{ message }</strong>
  </div>
)
