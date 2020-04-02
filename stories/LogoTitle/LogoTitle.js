import './LogoTitle.styl'
import React from 'react'

const LogoTitle = () => {
  return (
    <h1 className="logo-title">
      <img src={ require('../../app/images/logos/hyphe.png') } />
      <span>Hyphe <i>browser</i></span>
    </h1>
  )
}

export default LogoTitle