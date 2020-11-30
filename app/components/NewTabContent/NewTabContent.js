import './NewTabContent.styl'

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage as T, useIntl } from 'react-intl'
import { isWebUri } from 'valid-url'

import { SEARCH_ENGINES } from  '../../constants'

import { getSearchUrl } from '../../utils/search-web'

const NewTabContent = ({
  isEmpty,
  selectedEngine,
  onSelectStack,
  onSetTabUrl,
  onChangeEngine,
}) => {
  const { formatMessage } = useIntl()
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
        <h1><T id="new-tab.getting-started" /></h1>
        <div className="starter-container">
          <div>
            <p><T id="new-tab.begin-phrase" /></p>
          </div>
          <ul className="actions-container">
            <li onClick={ () => setCurrentAction('search') } className={ `action-container ${currentAction === 'search' ? 'is-active': ''}` }>
              <button>
                <h3><T id="new-tab.browse" /></h3>
                <h4><T id="new-tab.browse-sentence" /></h4>
              </button>
            </li>
            <li 
              onClick = { () => onSelectStack('DISCOVERED') }
              className={ `action-container ${currentAction === 'explore' ? 'is-active': ''} ${isEmpty ? 'is-disabled': ''}` }
            >
              <button>
                <h3><T id="new-tab.review" /></h3>
                <h4><T id="new-tab.review-sentence" /></h4>
              </button>
            </li>
            <li 
              onClick = { handleSelectTagStack }
              className={ `action-container ${currentAction === 'tag' ? 'is-active': ''} ${isEmpty ? 'is-disabled': ''}` }
            >
              <button>
                <h3><T id="new-tab.tag" /></h3>
                <h4><T id="new-tab.tag-sentence" /></h4>
              </button>
            </li>
          </ul>
          {currentAction &&
            <div className="action-details">
              <ul className="browser-search">
                <li>
                  <T id="new-tab.search-with" />
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
                      placeholder={ formatMessage({ id: 'new-tab.search-placeholder' }, { selectedEngine }) }
                      onChange={ e => setQuery(e.target.value) }
                    />
                    <button>
                      <T id="search" />
                    </button>
                  </form>
                </li>
                <li>
                  <T id="new-tab.url-address-prompt" />
                </li>
                <li className="form-container">
                  <form className="form" onSubmit={ handleSubmitSearchUrl }>
                    <input 
                      value={ searchUrl } 
                      placeholder={ formatMessage({ id: 'new-tab.url-placeholder' }) }
                      onChange={ e => setSearchUrl(e.target.value) } 
                    />
                    <button>
                      <T id="new-tab.visit" />
                    </button>
                  </form>
                </li>
              </ul>
            </div>
          }
        </div>
        <div className="doc-intro-container">
          <T id="intro_md">{chunks => <span  dangerouslySetInnerHTML={ { __html: chunks } } />}</T>
        </div>
      </div>
    </div>
  )
}

NewTabContent.propTypes = {
  isEmpty: PropTypes.bool.isRequired,
  selectedEngine: PropTypes.string.isRequired,
  onSelectStack: PropTypes.func.isRequired,
  onSetTabUrl: PropTypes.func.isRequired,
  onChangeEngine: PropTypes.func.isRequired,
}

export default NewTabContent
