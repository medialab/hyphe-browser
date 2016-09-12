import '../../css/browser/page-hyphe-home'
import React, { PropTypes } from 'react'
import { FormattedMessage as T, intlShape } from 'react-intl'

import { getSearchUrl } from '../../utils/search-web'

class PageHypheHome extends React.Component {

  constructor (props) {
    super(props)
    this.state = { q: '' }
  }

  onSubmit (evt) {
    evt.preventDefault()
    this.props.onSubmit(getSearchUrl(this.state.q))
  }

  render () {
    const formatMessage = this.context.intl.formatMessage

    return (
      <div className="page-hyphe-home">
        <form className="google-form" onSubmit={ (e) => { this.onSubmit(e) } }>
          <h2><T id="google.search" /> <strong>Google</strong></h2>
          <div>
            <input type="search" value={ this.state.value }
              placeholder={ formatMessage({ id: 'google.placeholder' }) }
              onChange={ ({ target }) => { this.setState({ q: target.value }) } } />
            <button>
              <span className="icon icon-search"></span>
            </button>
          </div>
        </form>
      </div>
    )
  }
}

PageHypheHome.contextTypes = {
  intl: intlShape
}

PageHypheHome.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default PageHypheHome
