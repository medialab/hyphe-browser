
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const WebentityNameField = ({
  initialName,
  onSubmit
}, { intl: { formatMessage }}) => {
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
  const handleValidate = () => {
    onSubmit(webentityName)
  }

  const handleCancel = () => {
    setWebentityName(initialName)
  }

  return (
    <div className="webentity-name-container">
      <input
        className="input" 
        value={ webentityName }
        onKeyUp={ handleKeyUp }
        placeholder={formatMessage({ id: 'sidebar.cartel.webentity-name-title' })}
        // onFocus={ handleFocus }
        // onBlur={ handleBlur }
        onChange={ handleChange } />
        {
          webentityName !== initialName &&
          <>
            <button onClick={handleValidate} className="btn btn-success">
              <i className="ti-check" />
            </button>
            <button onClick={handleCancel} className="btn btn-error">
              <i className="ti-close" />
            </button>
          </>
        }
    </div>
  )
}

WebentityNameField.contextTypes = {
  intl: PropTypes.object,
}

export default WebentityNameField