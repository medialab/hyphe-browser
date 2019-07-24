import './NewTabContent.styl'

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage as T, intlShape, FormattedHTMLMessage } from 'react-intl'
import { isWebUri } from 'valid-url'

import { SEARCH_ENGINES } from  '../../constants'

import { getSearchUrl } from '../../utils/search-web'

// const CORPUS_HELP = 'a corpus is a network of webpages, regrouped as webentities, representing the result of an inquiry into a specific issue on the web'
// const WEBENTITY_HELP = 'a webentity is a group of webpages defined to correspond to the presence of a specific actor on the web'
// const IN_HELP = 'the IN webentities are the webentities defined as relevant to the inquiry'
// const OUT_HELP = 'the IN webentities are the webentities defined as irrelevant to the inquiry'
// const PROSPECTION_HELP = 'the PROSPECTION webentities are the webentities discovered during the inquiry during browsing, or crawling operations by the hyphe server'

const NewTabContent = ({
  isEmpty,
  selectedEngine,
  onSelectStack,
  onSetTabUrl,
  onChangeEngine
}) => {
  const [currentAction, setCurrentAction] = useState(isEmpty ? 'search': undefined)
  const [query, setQuery] = useState('')
  const [searchUrl, setSearchUrl] = useState('')
  
  const handleSubmitQuery = (e) => {
    e.preventDefault()
    onSetTabUrl(getSearchUrl(selectedEngine, query))
  }

  const handleSubmitSearchUrl = (e) => {
    e.preventDefault()
    const url = ((u) => {
      if (!isWebUri(u)) {
        const httpu = 'http://' + u
        if (isWebUri(httpu)) {
          return httpu
        } else {
          const searchu = getSearchUrl(selectedEngine, u)
          return searchu
        }
      } else {
        return u
      }
    })(searchUrl.trim())
    onSetTabUrl(url)
  }
  
  const handleChangeEngine = (e) => onChangeEngine(e.target.value)
  const handleSelectTagStack = () => {
    const filter = 'no-tag'
    onSelectStack('IN', filter)
  } 
  return (
    <div className="entry-tab-content">
      <div className="content-wrapper">
        <h1>Getting started</h1>
        <div className="starter-container">
          <div>
            <p>To begin your inquiry session with Hyphe Browser, you can :</p>
          </div>
          <ul className="actions-container">
            <li onClick={ () => setCurrentAction('search') } className={ `action-container ${currentAction === 'search' ? 'is-active': ''}` }>
              <button>
                <h3>Browse</h3>
                <h4>the web for relevant webpages</h4>
              </button>
            </li>
            <li 
              onClick = { () => onSelectStack('DISCOVERED') }
              className={ `action-container ${currentAction === 'explore' ? 'is-active': ''} ${isEmpty ? 'is-disabled': ''}` }>
              <button>
                <h3>Review</h3>
                <h4>webentities in prospection to expand your corpus</h4>
              </button>
            </li>
            <li 
              onClick = { handleSelectTagStack }
              className={ `action-container ${currentAction === 'tag' ? 'is-active': ''} ${isEmpty ? 'is-disabled': ''}` }>
              <button>
                <h3>Tag</h3>
                <h4>webentities already included in your corpus</h4>
              </button>
            </li>
          </ul>
          {currentAction &&
            <div className="action-details">
              <ul className="browser-search">
                <li>
                  Search with 
                  <select value={ selectedEngine || 'google' } onChange={ handleChangeEngine }>
                    {
                      SEARCH_ENGINES.map((engine, index) => {
                        return <option key={ index } value={ engine.value }>{engine.label}</option>
                      })
                    }
                  </select>
                </li>
                <li className="form-container">
                  <form className="form" onSubmit={ handleSubmitQuery }>
                    <input 
                      value={ query }
                      placeholder={ `search with ${selectedEngine}` }
                      onChange={ e => setQuery(e.target.value) } />
                    <button>search</button>
                  </form>
                </li>
                <li>
                  ... or directly start with a URL address:
                </li>
                <li className="form-container">
                  <form className="form" onSubmit={ handleSubmitSearchUrl }>
                    <input value={ searchUrl } placeholder="enter URL address here" onChange={ e => setSearchUrl(e.target.value) } />
                    <button>go</button>
                  </form>
                </li>
              </ul>
            </div>
          }
        </div>
        <FormattedHTMLMessage id="intro_md" />
      </div>
    </div>
  )
}
NewTabContent.contextTypes = {
  intl: intlShape
}

NewTabContent.propTypes = {
  isEmpty: PropTypes.bool.isRequired,
  selectedEngine: PropTypes.string.isRequired,
  onSelectStack: PropTypes.func.isRequired,
  onSetTabUrl: PropTypes.func.isRequired,
  onChangeEngine: PropTypes.func.isRequired,
}

export default NewTabContent