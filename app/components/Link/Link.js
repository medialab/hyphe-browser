import React from 'react'
import PropTypes from 'prop-types'
const { shell } = require('electron')

const Link = ({
  children,
  url,
  title,
  className = '',
}) => {
  return (
    <a
      href="#"
      className={ className }
      aria-label={ title }
      onClick= { e => {
        e.preventDefault()
        e.stopPropagation()

        if (url) {
          shell.openExternal(url)
        }
      } }
    >
      {children}
    </a>
  )
}

Link.propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string
}

export default Link
