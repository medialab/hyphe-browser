import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import {
  fetchEgoNetwork,
} from '../../../actions/webentities'
import { toggleNetwork} from '../../../actions/browser'

class SideBarEgoNetwork extends React.Component {

  componentDidMount () {
    const { webentity, serverUrl, corpusId } = this.props
    this.props.fetchEgoNetwork(serverUrl, corpusId, webentity)
  }

  componentWillReceiveProps ({ webentity, serverUrl, corpusId }) {
    if ((webentity && this.props.webentity && webentity.id !== this.props.webentity.id)) {
      this.props.fetchEgoNetwork(serverUrl, corpusId, webentity)
    }
  }

  render () {
    // const { formatMessage } = this.context.intl
    const { webentity, showNetwork, toggleNetwork } = this.props
    const { egonetwork } = webentity
    return (
      <div className="browser-side-bar-ego-network">
        <h3 onClick={ () => toggleNetwork() }>
          <T id="sidebar.egonetwork" />
          <span className={ cx({
            'ti-angle-up': showNetwork,
            'ti-angle-down': !showNetwork
          }) }></span>
        </h3>
        {
          showNetwork &&
          <div>
            { egonetwork ? 
              <span>{egonetwork.length}</span>
              : <T id="loading" />
            }
          </div>
        }
      </div>
    )
  }
}

SideBarEgoNetwork.contextTypes = {
  intl: intlShape
}

SideBarEgoNetwork.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object.isRequired,

  showNetwork: PropTypes.bool.isRequired,
 
  // actions
  fetchEgoNetwork: PropTypes.func,
  toggleNetwork: PropTypes.func.isRequired
  
}

const mapStateToProps = ({ corpora, intl: { locale }, ui }, props) => ({
  ...props,
  showNetwork: ui.showNetwork,
  locale
})

export default connect(mapStateToProps, {
  fetchEgoNetwork,
  toggleNetwork
})(SideBarEgoNetwork)

