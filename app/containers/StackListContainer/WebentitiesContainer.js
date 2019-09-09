import React, {useRef} from 'react';
import cx from 'classnames'
import { Scrollbars } from 'react-custom-scrollbars';

const WebentitiesContainer = ({
  children,
  isLoading,
  scrollTo,
  onScrollSuccess,
  isEmpty,
}) => {
  const elRef = useRef(null)
  const scrollbar = useRef(null)
  if (scrollTo) {
    const parent = elRef && elRef.current;
    const children = parent && elRef.current.childNodes;
    if (children) {
      const match = Array.prototype.find.call(children, el => {
        return el.id === scrollTo;
      })
      if (match && scrollbar) {
        scrollbar.current.scrollTop(match.offsetTop)
        onScrollSuccess()
      }
    }
  }
  return (
    <Scrollbars 
      renderThumbVertical={() => <div style={{marginLeft: '3px', width: '3px', background: 'var(--color-blue)'}} />}
      ref={scrollbar}
    >
      <ul ref={elRef} className={cx('webentities-list', { 'is-loading': isLoading, 'is-empty': isEmpty })}>
        {children}
      </ul>    
    </Scrollbars>
  )
}

export default WebentitiesContainer;