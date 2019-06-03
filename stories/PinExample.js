import React from 'react'

import HelpPin from '../app/components/HelpPin'

const PinExample = function (){
  return (
    <div style={ { position: 'relative' } }>
      <h3 >
        <span />
        <span>Tags <HelpPin>about tags</HelpPin></span>
                
      </h3>
    </div>
  )
}

export default PinExample