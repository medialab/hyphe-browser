import React from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'
import { FormattedMessage as T } from 'react-intl'
import { get, set } from 'lodash'

class CreateServerFormStep extends React.Component {
  constructor (props) {
    super(props)

    // Use inital state as state placeholder:
    props.setData({
      ...this.getInitialData(),
      ...props.data
    })
  }

  /**
   * This will force the parent to re-render, with the proper `isDisabled`
   * etc...
   */
  componentDidMount () {
    this.props.notifyIsReady()
  }

  /**
   * DEFAULTS TO OVERRIDE:
   * *********************
   */
  getInitialData () {
    return {}
  }
  isDisabled () {
    return false
  }
  // eslint-disable-next-line react/sort-comp
  render () {
    return (
      <></>
    )
  }


  /**
   * HELPERS:
   * ********
   */

  /**
   * This method renders an input
   *
   * @param keys       The key where the input data is attached in the
   *                   component's parent data state.
   *                   Also accepts an array of strings, used as a path in the
   *                   state object.
   * @param labelKey   The localisation key for the label.
   * @param onChange   A `(value: any) => void` handler (optional)
   * @param error      An error message that will be shown next to the label.
   * @param horizontal If true, the `form-group` will have the `horizontal`
   *                   class, and the input will be rendered before the label.
   * @param type       The input type (optional, defaults to `"text"`). Accepts
   *                   all valid values for `input` tags, and `select` and
   *                   `textarea`.
   * @param options    An array of `{key: string, label: string}` available
   *                   values, to generate the options list, when using a
   *                   `select` type.
   * @param attributes A map of arbitrary HTML attributes, that will be added to
   *                   the input element.
   * @returns          A React pseudo-DOM tree.
   */
  renderInput (keys, labelKey, { onChange, error, horizontal, type = 'text', options = [], attributes = {} } = {}) {
    const key = Array.isArray(keys) ? keys.join('.') : keys
    const value = get(this.props.data, keys, '')
    const id = `step${this.props.step}-${key}`
    const handler = ({ target }) => {
      const v = type === 'checkbox' ? target.checked : target.value

      if (onChange) {
        onChange(v)
      } else {
        this.props.setData(set({ ...this.props.data }, keys, v))
      }
    }
    let input

    if (type === 'textarea') {
      input = (
        <textarea
          id={ id }
          value={ value }
          onChange={ handler }
          { ...attributes }
        />
      )
    } else if (type === 'select') {
      input = (
        <select
          id={ id }
          value={ value }
          onChange={ handler }
          { ...attributes }
        >
          { options.map(({ key, label }) => <option key={ key } value={ key }>{label}</option>) }
        </select>
      )
    } else if (type === 'checkbox') {
      input = (
        <input
          id={ id }
          type={ type }
          onChange={ handler }
          checked={ value }
          { ...attributes }
        />
      )
    } else {
      input = (
        <input
          id={ id }
          type={ type }
          onChange={ handler }
          value={ value }
          { ...attributes }
        />
      )
    }

    return (
      <div key={ key } className={ cx('form-group', horizontal && 'horizontal', error && 'error') }>
        {horizontal && input}
        <label htmlFor={ id }><T id={ labelKey } />{ error && <span className="error-message">❌ { error }</span> }</label>
        {!horizontal && input}
      </div>
    )
  }
}

CreateServerFormStep.propTypes = {
  intl: PropTypes.object.isRequired,
  step: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  isProcessing: PropTypes.bool.isRequired,

  // Handlers:
  submit: PropTypes.func.isRequired,
  setData: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  setIsProcessing: PropTypes.func.isRequired,
  notifyIsReady: PropTypes.func.isRequired,
}

// Export variables common to the different steps:
export const NULL_SELECT_VALUE = 'HYPHE-BROWSER::NO-VALUE'

export default CreateServerFormStep
