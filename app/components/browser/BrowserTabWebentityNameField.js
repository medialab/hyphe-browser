import React, { PropTypes } from 'react'
import cx from 'classnames'

import '../../css/browser/browser-tab-webentity-name-field'

class BrowserTabWebentityNameField extends React.Component {

  onKeyPress (e) {
    if (e.charCode === 13) {
      e.stopPropagation()
      this.props.onChange(e.target.value);
    }
  }

  render () {
    return <input className={ cx('browser-tab-webentity-name over-overlay', { loading: !this.props.initialValue }) }
      disabled={ this.props.disabled } // PAGE_HYPHE_HOME
      defaultValue={ this.props.initialValue }
      readOnly={ !this.props.editable || !this.props.initialValue }
      onKeyPress={ e => this.onKeyPress(e) } />
  }
}

BrowserTabWebentityNameField.propTypes = {
  initialValue: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  editable: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
}

BrowserTabWebentityNameField.defaultProps = {
  initialValue: ''
}

export default BrowserTabWebentityNameField
