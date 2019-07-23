
import React, { useState, useEffect } from 'react'

const WebentityNameField = ({
  initialName,
  onSubmit
}) => {
  const [webentityName, setWebentityName] = useState(initialName)

  useEffect(() => {
    setWebentityName(initialName)
  }, [initialName])
  
  const handleChange = (e) => setWebentityName(e.target.value)
  const handleKeyUp = (e) => {
    if (~[13, 27].indexOf(e.keyCode)) {
      // this.setState({ dirty: false, editing: false })
      e.target.blur()
      if (e.keyCode === 13) { // ENTER
        onSubmit(e.target.value)
      } else if (e.keyCode === 27) { // ESCAPE
        setWebentityName(initialName)
      }
    }
  }

  return (
    <input
      className="input" 
      value={ webentityName }
      onKeyUp={ handleKeyUp }
      // onFocus={ handleFocus }
      // onBlur={ handleBlur }
      onChange={ handleChange } />
  )
}

export default WebentityNameField