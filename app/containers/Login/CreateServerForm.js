// deploying a Hyphe cloud server (multiple steps)

import React from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage as T, injectIntl } from 'react-intl'

import IntroStep from './CreateServerFormSteps/IntroStep'
import AuthenticationStep from './CreateServerFormSteps/AuthenticationStep'
import HypheConfigurationStep from './CreateServerFormSteps/HypheConfigurationStep'
import ServerConfigurationStep from './CreateServerFormSteps/ServerConfigurationStep'
import DeployStep from './CreateServerFormSteps/DeployStep'

/**
 * Each of the following components extends the dumb `CreateServerFormStep`.
 * Also, their order in this array will be their order in the user interface.
 * Check it to understand how the step components should work:
 */
const STEPS = [
  IntroStep,
  AuthenticationStep,
  HypheConfigurationStep,
  ServerConfigurationStep,
  DeployStep
]

class CreateServerForm extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      isProcessing: false,
      errors: [],
      step: 0,
      data: {},
    }

    this.formStep = React.createRef()
  }

  onSubmit = () => {
    if (this.isDisabled()) {
      return
    }

    if (this.formStep.current.handleSubmit) {
      this.formStep.current.handleSubmit(() => this.nextStep())
    } else {
      this.nextStep()
    }
  }

  nextStep () {
    const { step } = this.state

    if (step >= STEPS.length - 1) {
      this.props.history.push('/login')
    } else {
      this.setState({
        ...this.state,
        errors: [],
        step: this.state.step + 1,
      })
    }
  }

  isDisabled () {
    return this.state.isProcessing || !this.formStep.current || this.formStep.current.isDisabled(this.state.data)
  }

  onCancel = () => {
    switch (this.state.step) {
    case 0:
      this.props.history.push('/login')
      break
    default:
      this.setState({
        ...this.state,
        isProcessing: false,
        step: this.state.step - 1,
        errors: []
      })
      break
    }
  }

  render () {
    const { step, errors } = this.state

    const FormStepComponent = STEPS[step]

    return (
      <form
        className="create-server-form"
        onSubmit={ e => {
          e.preventDefault()
          this.onSubmit()
        } }
      >
        <h3 className="section-header">
          <T id={ `create-cloud-server.step${step}.title` } />
        </h3>

        {
          errors.map((error) =>
            <div className="form-error" key={ error }><T id={ error } /></div>
          )
        }

        <FormStepComponent
          { ...{
            ref: this.formStep,

            step,
            intl: this.props.intl,
            data: this.state.data,

            setData: data => this.setState({ ...this.state, data }),
            setError: error => this.setState({ ...this.state, errors: [error] }),
            setIsProcessing: isProcessing => this.setState({ isProcessing }),
            notifyIsReady: () => this.forceUpdate()
          } }
        />

        <div className="buttons-row">
          {
            /* Last step is not cancelable */
            step < STEPS.length - 1 &&
            <li>
              <button type="button" className="btn btn-error" disabled={ this.state.submitting } onClick={ this.onCancel }>
                <T id={ step === 0 ? 'cancel' : 'back' } />
              </button>
            </li>
          }
          <li className="main-button-container">
            <button className={ cx('btn btn-primary', { 'is-disabled': this.isDisabled() }) }>
              <T id={ `create-cloud-server.step${step}.submit` } />
            </button>
          </li>
        </div>
      </form>
    )
  }
}

CreateServerForm.propTypes = {
  // router
  history: PropTypes.shape({
    push: PropTypes.func,
  }),

  locale: PropTypes.string.isRequired,
  credentials: PropTypes.object,

  // actions
  createServer: PropTypes.func,
  saveCredentials: PropTypes.func
}

CreateServerForm.contextTypes = {
  intl: PropTypes.object,
}

const mapStateToProps = ({ cloud, intl: { locale } }) => ({
  locale,
  credentials: cloud.credentials
})

export default injectIntl(connect(mapStateToProps)(CreateServerForm))
