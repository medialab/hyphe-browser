import './NewTabContent.styl'

import React, { useState } from 'react'


const NewTabContent = function ({
  isEmpty
}) {
  const [currentAction, setCurrentAction] = useState(isEmpty ? 'search': undefined)
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
                <h3>Search</h3>
                <h4>on the web thanks to a search engine</h4>
              </button>
            </li>
            <li className={ `action-container ${currentAction === 'explore' ? 'is-active': ''} ${isEmpty ? 'is-disabled': ''}` }>
              <button>
                <h3>Review</h3>
                <h4>webentities in prospection to expand your corpus</h4>
              </button>
            </li>
            <li className={ `action-container ${currentAction === 'tag' ? 'is-active': ''} ${isEmpty ? 'is-disabled': ''}` }>
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
              <select value="google">
                <option>google</option>
                <option>duck duck go</option>
                <option>qwant</option>
              </select>
            </li>
            <li className="main">
              <input placeholder="search with google" />
            </li>
          </ul>
        </div>
          }
        </div>
        <div className="quick-intro">
          <h2>What is this all about ?</h2>
          <p>
              Hyphe browser is an inquiry companion which is aimed at building a <em>corpus</em> of webpages relevant to your inquiry and annotate them.
          </p>
          <p>
              Hyphe browser allows to regroup webpages as <em>webentities</em> which correspond to specific persons, organizations, etc. relevant to your inquiry.
          </p>
          <p>Hyphe browser allows to qualitatively review webentities and choose whether they should be included in the corpus. When a webentity is included in the corpus, the Hyphe server automatically navigates to each of its webpages and analyze their content to discover linked webentities that may be related to your inquiry.</p>
            
          <h2>How should I work ?</h2>
          <p>
                A typical workflow with hyphe browser could look like that :
          </p>
          <ol>
            <li>you define a few websites relevant to your inquiry, browse to them with hyphe browser, and INclude them in the corpus</li>
            <li>each webentity included in the corpus will be automatically analyzed by the hyphe server to discover new webentities and add them to the PROSPECTION list</li>
            <li>you review webentities proposed by the server, reading them with the browser and making the choice to include some of them in the corpus while excluding the others</li>
            <li>the 2 previous steps repeat as long as you are not satisfied with the web territory covered by your inquiry</li>
            <li>once your corpus is stabilized, you can tag your webentities according to different categories and then visualize them as a network in hyphe</li>
          </ol>
          <h2>Can you explain the main notions ?</h2>
          <div className="glossary-item">
            <h4>Webentity</h4>
            <p />
          </div>
            
          <div className="glossary-item">
            <h4>Prospection / In / Out / undecided</h4>
            <p />
          </div>

        </div>
      </div>
    </div>
  )
}

export default NewTabContent