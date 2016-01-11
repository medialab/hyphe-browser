import React, { PropTypes } from 'react'

const App = (props) => {

  // populated by the router
  const { children } = props

  return (
    <div className="window">
      <div className="window-content">
        { children }
      </div>
    </div>
  )

}

App.propTypes = {
  children: PropTypes.node
}

export default App
