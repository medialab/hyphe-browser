import './BodyTooltip.styl'

import React from 'react'
import ReactDOM from 'react-dom'
import ReactTooltip from 'react-tooltip'

// Create root level element for react-tooltips
const domNode = document.createElement('div')
document.body.appendChild(domNode)

// Wrapper component to portal react-tooltips
const BodyPortal = ({ children }) => {
  return ReactDOM.createPortal(
    children,
    domNode
  )
}

// Custom tooltip wrapper to ensure all tooltips get rendered into the portal
const BodyTooltip = (props) => {
  return (
    <BodyPortal>
      <ReactTooltip
        className="body-tooltip"
        effect="solid"
        { ...props }
      />
    </BodyPortal>
  )
}

export default BodyTooltip
