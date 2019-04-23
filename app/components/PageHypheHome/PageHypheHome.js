import './page-hyphe-home.styl'
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

  handleSubmit = (e) => {
    const { selectedEngine } = this.props
    e.preventDefault()
    this.props.onSetTabUrl(getSearchUrl(selectedEngine, this.state.q))
  }

  handleChangeInput = (e) =>  this.setState({ q: e.target.value })
  
  handleChangeEngine = (e) => this.props.onChangeEngine(e.value)

  render () {
    const { selectedEngine } = this.props
    const formatMessage = this.context.intl.formatMessage
    
    return (
      <div className="page-hyphe-home">
        <form className="google-form" onSubmit={ this.handleSubmit }>
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
              onChange={ this.handleChangeEngine }
            />
          </div>
          <div>
            <input className="input-query" type="search" value={ this.state.value }
              placeholder={ formatMessage({ id: 'google.placeholder' }) }
              onChange={ this.handleChangeInput }
            />
            <button>
              <span className="ti-search" />
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
  onSetTabUrl: PropTypes.func.isRequired,
  onChangeEngine: PropTypes.func.isRequired,
}

export default PageHypheHome
