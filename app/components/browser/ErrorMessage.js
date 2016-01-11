import React from 'react'

export default ({ message }) => message
  ? (
    <div className="error-dialog">
      <strong>{ message }</strong>
    </div>
  )
  : <noscript />
