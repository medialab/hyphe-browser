import React, { useState } from 'react'
import Modal from 'react-modal'
import cx from 'classnames';
import HelpPin from '../../app/components/HelpPin'

import './ServerChoice.styl'

import LogoTitle from '../LogoTitle'

const CorporaList = ({ loading }) => {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <div className="config-container">
      <div className="server-container">
        <h3 className="section-header">Choose a hyphe server</h3>
        <div className="select-container">
          <select
            autoFocus
            value = { 'server-1' }
          >
            <option value="Sélectionner un serveur">Select a server</option>
            <option value="server-1">Serveur 1</option>
            <option value="server-2">Serveur 2</option>
            <option value="add">Add a server</option>
          </select>
          <button className="hint--bottom" aria-label="Edit server information">
            <i className="ti-pencil" />
          </button>
          <button onClick={ () => setModalOpen(true) } className="hint--bottom" aria-label="Forget server">
            <i className="ti-trash" />
          </button>
        </div>
      </div>
      <div>
        {!loading && <h3>Choose a corpus</h3>}
        {!loading &&
        <div className="search-container">
          <input placeholder="Search among 12 corpora" />
          <span className="icon ti-search" />
        </div>
        }
      </div>
      {loading ?
        <div className="loading-container">
        Loading corpora list<span>.</span><span>.</span><span>.</span>
        </div>
        :
        <ul className="corpora-list-container">
          {Array(10).fill(1).map((e, i) => (<li key={ i } className="corpus-card">
            <h2>Nom du corpus</h2>
            <h3>3 webentities</h3>
            <div className="corpus-dates">
            Created 2 minutes ago - used 2 minutes ago
            </div>
          </li>))}
        </ul>
      }
      {!loading && <div className="create-corpus-container">
        <button>
          Create a new corpus
        </button>
      </div>}
      <Modal 
        isOpen={ modalOpen } 
        onRequestClose={ () => setModalOpen(false) }
        style={ {
          content: {
            width: 700,
            maxWidth: '90vw',
            position: 'relative',
            height: 'unset',
            top: 0,
            left: 0,
            overflow: 'hidden',
            padding: 0
          }
        } }
      >
        <div style={ { marginBottom: '10px', padding: '10px' } }>Are you sure you want to forget this server (you will have to re-enter its URL if you change your mind) ?</div>
        <ul onClick={ () => setModalOpen(false) } className="buttons-row">
          <li>
            <btn className="btn btn-error">
              Cancel
            </btn>
          </li>

          <li>
            <btn className="btn btn-success">
              Forget this server
            </btn>
          </li>
        </ul>
      </Modal>
    </div>
  )
}

const ServerChoice = ({
  noServer,
  newServer,
  newCorpus,
  loading
}) => {
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [advancedOptions, setAdvancedOptions] = useState(false)
  return (
    <div className="server-choice">
      <div className="server-choice-container">
        <LogoTitle />
        {
          noServer ?
            <div className="config-container">
              <h3 className="section-header">Choose a hyphe server</h3>
              <select
                autoFocus
                value = { 'Sélectionner un serveur' }
              >
                <option value="Sélectionner un serveur">Select a server</option>
                <option value="server-1">Serveur 1</option>
                <option value="server-2">Serveur 2</option>
                <option value="add">Add a server</option>
              </select>
            </div>
            :
            null
        }
        {
          newServer &&
            <div className="config-container">
              <h3 className="section-header">Create/configure a server information</h3>
              <div className="config-form">
                <div className="field">
                  <label>Choose a name for the hyphe server</label>
                  <input placeholder="Server name" value="pprd" />
                </div>
                <div className="field">
                  <label>Indicate the hyphe server's URL</label>
                  <input placeholder="Server URL" value="https://hyphe.medialab.sciences-po.fr/demo/api/" />
                </div>
              </div>
              <ul className="buttons-row">
                
                <li>
                  <btn className="btn btn-error">
                    Cancel
                  </btn>
                </li>

                <li>
                  <btn className="btn btn-success">
                    Save
                  </btn>
                </li>
              </ul>
            </div>
        }
        {
          newCorpus &&
            <div className="config-container">
              <h3 className="section-header">Create a new corpus</h3>
              <div className="config-form">
                <div className="field">
                  <label>Corpus name</label>
                  <input placeholder="Corpus name" />
                </div>
                <div className={cx('options-wrapper', {active: passwordProtected})}>
                  <div onClick={ () => setPasswordProtected(!passwordProtected) } className="field horizontal">
                    <input checked={ passwordProtected } type="radio" />
                    <label>password protected</label>
                  </div>
                  {passwordProtected && 
                  <>
                    <div className="field">
                      <label>Corpus password</label>
                      <input placeholder="Corpus password" type="password" />
                    </div>
                    <div className="field">
                      <label>Confirm corpus password</label>
                      <input placeholder="Corpus password" type="password" />
                    </div>
                  </>
                  }
                </div>
                <div className={cx('options-wrapper', {active: advancedOptions})}>
                  <div onClick={ () => setAdvancedOptions(!advancedOptions) } className="field horizontal">
                    <input checked={ advancedOptions } type="radio" />
                    <label>advanced creation options</label>
                  </div>
                  {advancedOptions && 
                  <>
                    <div className="field">
                      <label>Default depth of crawl <HelpPin place="top">
                       define how many iterations of crawling to do after having INcluded a new webentity in the corpus
                      </HelpPin>

                      </label>
                      <div className="field horizontal minified">
                        <input type="radio" />
                        <label>1</label>
                      </div>
                      <div className="field horizontal minified">
                        <input type="radio" />
                        <label>2</label>
                      </div>
                      <div className="field horizontal minified">
                        <input type="radio" />
                        <label>3</label>
                      </div>
                    </div>
                    <div className="field">
                      <label>Default webentity creation rules <HelpPin place="top">
                      define at which level or URL to "cut" by default when grouping webpages into webentities
                      </HelpPin>

                      </label>
                      <div className="field horizontal minified">
                        <input type="radio" />
                        <label>domain</label>
                      </div>
                      <div className="field horizontal minified">
                        <input type="radio" />
                        <label>subdomain</label>
                      </div>
                      <div className="field horizontal minified">
                        <input type="radio" />
                        <label>page</label>
                      </div>
                    </div>
                  </>
                  }
                </div>
              </div>
              
              <ul className="buttons-row">
                
                <li>
                  <btn className="btn btn-error">
                    Cancel
                  </btn>
                </li>

                <li>
                  <btn className="btn btn-success">
                    Save
                  </btn>
                </li>
              </ul>
            </div>
        }
        {
          (!newServer && !newCorpus && !noServer) &&
            <CorporaList loading={ loading } />
        }
      </div>
    </div>
  )
}

export default ServerChoice
