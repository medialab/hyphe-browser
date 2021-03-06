import '../../css/spinner.css'

import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage as T } from 'react-intl'

const Spinner = ({ textId }) => {
  return (
    <div className="spinner">
      <div className="spinner-anim">
        <div className="sk-folding-cube">
          <div className="sk-cube1 sk-cube" />
          <div className="sk-cube2 sk-cube" />
          <div className="sk-cube4 sk-cube" />
          <div className="sk-cube3 sk-cube" />
        </div>
      </div>
      <div className="spinner-text">
        { textId ? <T id={ textId } /> : null }
      </div>
    </div>
  )
}

Spinner.propTypes = {
  textId: PropTypes.string
}

export default Spinner
