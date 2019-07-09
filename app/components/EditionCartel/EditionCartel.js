import './EditionCartel.styl'

import React from 'react'
import cx from 'classnames'

import HelpPin from '../HelpPin'

const EditionCartel = ({
  isOpen,
  onToggle,
  children,
  title,
  help,
  isAlwaysOpen,
  helpPlace = 'bottom'
}) => {
  return (
    <div className={ cx('edition-cartel', { 'is-always-open': isAlwaysOpen, 'is-open': isAlwaysOpen || isOpen }) }>
      <div className="edition-cartel-header">
        <h4 onClick={ onToggle }>
          <span className="arrow-container">{
            isOpen ?
              <i className="ti-angle-up" />
              :
              <i className="ti-angle-down" />
          }
          </span>
          <span className="title">{title} <HelpPin place={ helpPlace }>{help}</HelpPin></span>
        </h4>
      </div>
      <div className="edition-cartel-content">
        {children}
      </div>
    </div>
  )
}

export default EditionCartel