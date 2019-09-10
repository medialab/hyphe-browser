import { useEffect } from 'react';
import PropTypes from 'prop-types';

const ScrollHandler = ({ 
  target, 
  parent, 
  children, 
  callback, 
  transitionDuration = 100,
  trigger,
}) => {

  useEffect(() => {
    const test = setTimeout(() => {
      if (parent && parent.current && target) {
        const element = document.getElementById(target);

        setTimeout(() => {
          parent.current.scrollTo({
            behavior: element ? 'smooth' : 'auto',
            top: element ? element.offsetTop : 0
          });
          if (typeof callback === 'function') {
            callback()
          }
        }, transitionDuration);
      }
    }, 500)
   return () => clearTimeout(test)
  }, [target, trigger]);

  return children;
};

ScrollHandler.propTypes = {
  target: PropTypes.string,
};
export default ScrollHandler;