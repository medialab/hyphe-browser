import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import ScrollContainer from './ScrollContainer'


const WebentitiesContainer = ({
  children,
  isLoading,
  scrollTo,
  onScrollSuccess,
  isEmpty,
}) => {
  const elRef = useRef(null)
  return (
    <ScrollContainer callback={ onScrollSuccess } target={ scrollTo } parent={ elRef }>
      <ul ref={ elRef } className={cx('webentities-list', { 'is-loading': isLoading, 'is-empty': isEmpty })}>
        {children}
      </ul>    
    </ScrollContainer>
  )
}

WebentitiesContainer.propTypes = {
  children: PropTypes.node,
  isLoading: PropTypes.bool,
  scrollTo: PropTypes.string,
  onScrollSuccess: PropTypes.func,
  isEmpty: PropTypes.bool,
}

export default WebentitiesContainer