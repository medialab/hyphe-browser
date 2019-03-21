import '../../css/browser/page-hyphe-home'
import React, { PropTypes } from 'react'
import { FormattedMessage as T, intlShape } from 'react-intl'
import Select from 'react-select'

import { getSearchUrl } from '../../utils/search-web'

class PageHypheHome extends React.Component {

  constructor (props) {
    super(props)
    this.state = { 
      q: '',
      engines: [
        {
          value: 'google',
          label: 'Google'
        },
        {
          value: 'duckduckgo',
          label: 'DuckDuckGo'
        },
        {
          value: 'qwant',
          label: 'Qwant'
        },
        {
          value: 'lilo',
          label: 'lilo'
        },
      ]
    }
  }

  onSubmit (evt) {
    const { selectedEngine } = this.props
    evt.preventDefault()
    this.props.onSubmit(getSearchUrl(selectedEngine, this.state.q))
  }

  onChangeEngine (option) {
    const { updateSearchEngine } = this.props
    updateSearchEngine(option.value)
  }

  render () {
    const { selectedEngine } = this.props
    const formatMessage = this.context.intl.formatMessage

    return (
      <div className="page-hyphe-home">
        <form className="google-form" onSubmit={ (e) => { this.onSubmit(e) } }>
          <div className="select-container">
            <div className="search-text" >
              <T id="google.search" />
            </div>
            <Select
              name="engine-select"
              options={ this.state.engines }
              clearable={ false }
              searchable={ false }
              value={ selectedEngine || 'google' }
              onChange={ (option) => { this.onChangeEngine(option) } }
            />
          </div>
          <div>
            <input className="input-query" type="search" value={ this.state.value }
              placeholder={ formatMessage({ id: 'google.placeholder' }) }
              onChange={ ({ target }) => { this.setState({ q: target.value }) } } />
            <button>
              <span className="ti-search"></span>
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
  selectedEngine: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  updateSearchEngine: PropTypes.func.isRequired,
}

export default PageHypheHome
