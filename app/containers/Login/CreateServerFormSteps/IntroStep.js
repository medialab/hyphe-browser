import React from 'react'
import { FormattedMessage as T } from 'react-intl'

import CreateServerFormStep from './CreateServerFormStep'

class IntroStep extends CreateServerFormStep {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <>
        <p><T id="create-cloud-server.step0.p1" /></p>
        <p><T id="create-cloud-server.step0.p2" /></p>
        <p><T id="create-cloud-server.step0.p3" /></p>
        <ul>
          <li><T id="create-cloud-server.step0.p3.l1" /></li>
          <li><T id="create-cloud-server.step0.p3.l2" /></li>
          <li><T id="create-cloud-server.step0.p3.l3" /></li>
          <li><T id="create-cloud-server.step0.p3.l4" /></li>
          <li><T id="create-cloud-server.step0.p3.l5" /></li>
          <li><T id="create-cloud-server.step0.p3.l6" /></li>
        </ul>
        <h4><T id="create-cloud-server.step0.note" /></h4>
        <p><T id="create-cloud-server.step0.p4" /></p>
      </>
    )
  }
}

export default IntroStep
