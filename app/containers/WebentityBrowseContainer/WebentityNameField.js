
import React, { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'

const WebentityNameField = ({
  initialName,
  onSubmit,
  id
}) => {
  const [webentityName, setWebentityName] = useState(initialName)
  const [webentityId, setWebentityId] = useState(id)
  const { formatMessage } = useIntl()

  useEffect(() => {
    setWebentityName(initialName)
    setWebentityId(id)
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
        placeholder={ formatMessage({ id: 'sidebar.cartel.webentity-name-title' }) }
        // onFocus={ handleFocus }
        // onBlur={ handleBlur }
        onChange={ handleChange }
      />
      {
        id === webentityId &&
          webentityName !== initialName &&
          <>
            <button onClick={ handleValidate } className="btn btn-success">
              <i className="ti-check" />
            </button>
            <button onClick={ handleCancel } className="btn btn-error">
              <i className="ti-close" />
            </button>
          </>
      }
    </div>
  )
}

export default WebentityNameField