import React from 'react'
import { FormattedMessage as T } from 'react-intl'

import CreateServerFormStep from './CreateServerFormStep'

class HypheConfigurationStep extends CreateServerFormStep {
  constructor (props) {
    super(props)
  }

  initialData = {
    hypheConfig: null,
  }
  isDisabled (data) {
    // Only accept a valid JSON string or nothing for `hypheConfig`:
    if (!(data.hypheConfig || '').trim()) {
      return false
    }

    try {
      JSON.parse(data.hypheConfig)
      return false
    } catch (e) {
      return true
    }
  }

  render () {
    return (
      <>
        <p>
          <T id="create-cloud-server.step2.p1" />
        </p>

        {
          this.renderInput(
            'hypheConfig',
            'create-cloud-server.step2.hyphe-config',
            {
              type: 'textarea',
              attributes: { rows: '7', style: { resize: 'vertical' } }
            }
          )
        }
      </>
    )
  }
}

export default HypheConfigurationStep
