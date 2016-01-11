import React from 'react'

const App = (props) => {

  // populate by the router
  const { children } = props

  return (
    <div className="window">
      <div className="window-content">
        { children }
      </div>
    </div>
  )

}

export default App
