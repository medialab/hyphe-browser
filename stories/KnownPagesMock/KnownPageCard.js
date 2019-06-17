import React from 'react'
import cx from 'classnames'


export const KnownPageCard = ({
    id,
    homepage,
    isActive,
    isHomePage,
    displayHomePageButton = true,
  
    onClick,
  }) => {
    return (
      <li onClick={ onClick } className={ cx('known-page-card', { 'is-active': isActive }) } key={ id } title={ name + '\n' + homepage }>
        <div className="card-content">
          <div className="known-page-url" >{ homepage }</div>
          <div className="known-page-statistics">
            {`${parseInt(Math.random() * 40 + 1)} known citations`}
          </div>
        </div>
        <div className="card-actions">
          {
            displayHomePageButton
            &&
            <button 
              className={ cx('homepage-btn', 'hint--left', { 'is-active': isHomePage }) } 
              aria-label="set as the homepage of the webentity" 
            >
              <span className="ti-layers-alt" />
            </button>
          }
        </div>
      </li>
    )
  }

export default KnownPageCard