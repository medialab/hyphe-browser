import './NewTabContent.styl'

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage as T, intlShape } from 'react-intl'
import { isWebUri } from 'valid-url'

import { SEARCH_ENGINES } from  '../../constants'

import { getSearchUrl } from '../../utils/search-web'

const CORPUS_HELP = 'a corpus is a network of webpages, regrouped as webentities, representing the result of an inquiry into a specific issue on the web'
const WEBENTITY_HELP = 'a webentity is a group of webpages defined to correspond to the presence of a specific actor on the web'
const IN_HELP = 'the IN webentities are the webentities defined as relevant to the inquiry'
const OUT_HELP = 'the IN webentities are the webentities defined as irrelevant to the inquiry'
const PROSPECTION_HELP = 'the PROSPECTION webentities are the webentities discovered during the inquiry during browsing, or crawling operations by the hyphe server'

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
              onClick = { () => onSelectStack('IN_UNTAGGED') }
              className={ `action-container ${currentAction === 'tag' ? 'is-active': ''} ${isEmpty ? 'is-disabled': ''}` }>
              <button>
                <h3>Tag</h3>
                <h4>webentities already included in your corpus</h4>
              </button>
            </li>
          </ul>
          {currentAction 
        &&
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
        <div className="intro-contents">
          <h2>What is this all about ?</h2>
          <p>
              Hyphe browser is an inquiry companion for qualitatively mapping a subset of the world wide web concerned with a specific issue. It is aimed at building a <em className="hint--top" aria-label={ CORPUS_HELP }>corpus</em> of webpages relevant to your inquiry, annotate them and eventually visualize their relations to grasp how the issue is present on the web.
          </p>
          <p>
              Hyphe browser allows to navigate the web and regroup webpages as <em className="hint--top" aria-label={ CORPUS_HELP }>webentities</em> which correspond to the online presence of specific individuals, organizations, etc. relevant to your inquiry.
          </p>
          <p>Hyphe browser allows to qualitatively - and collectively - review and define the <em className="hint--top" aria-label={ WEBENTITY_HELP }>webentities</em> of your inquiry and choose whether they should be included <em className="hint--top" aria-label={ IN_HELP }>IN</em> the corpus or excluded <em className="hint--top" aria-label={ OUT_HELP }>OUT</em> of it. When a <em className="hint--top" aria-label={ WEBENTITY_HELP }>webentity</em> is included <em className="hint--top" aria-label={ IN_HELP }>IN</em> the <em className="hint--top" aria-label={ CORPUS_HELP }>corpus</em>, the Hyphe server automatically navigates to each of its webpages and analyzes their content to discover linked webentities that may be relevant to your inquiry (this is technically called <em className="hint--top" aria-label={ CORPUS_HELP }>crawling</em>).</p>
            
          <h2>How should I work ?</h2>
          <p>
                A typical workflow with hyphe browser could look like that :
          </p>
          <ol>
            <li>you define a few websites of individuals, organizations, actors, ... relevant to your inquiry, browse to them with hyphe browser, and include them <em className="hint--top" aria-label={ IN_HELP }>IN</em> the corpus</li>
            <li>each webentity included in the corpus will be automatically analyzed (<em>crawled</em>) by the hyphe server to discover new possibly relevant webentities and add them to the <em className="hint--top" aria-label={ PROSPECTION_HELP }>PROSPECTION</em> list</li>
            <li>you review webentities proposed by the server in the <em className="hint--top" aria-label={ PROSPECTION_HELP }>PROSPECTION</em> list, reading them with the browser and making the choice to include them <em className="hint--top" aria-label={ CORPUS_HELP }>IN</em> the corpus or exclude them <em className="hint--top" aria-label={ OUT_HELP }>OUT</em> of the corpus</li>
            <li>the 2 previous steps repeat as long as you are not satisfied with the web territory covered by your inquiry</li>
            <li>once your corpus is stabilized and your mapping seems comprehensive enough to start analyzing their relations, you can tag your webentities according to different categories and then visualize them as a network in hyphe (top right button)</li>
            <li>of course, all of this process is iterative and previous steps can repeat as much as necessary</li>
          </ol>
          <h2>Where can I find more documentation</h2>
          <div className="more-doc-container">
            <p>Head to the online documentation of Hyphe browser</p>
          </div>

        </div>
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