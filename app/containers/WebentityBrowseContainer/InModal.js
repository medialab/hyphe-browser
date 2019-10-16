import React, { useState, useCallback, useReducer } from 'react'
import Modal from 'react-modal'
import cx from 'classnames'

import isNumber from 'lodash/fp/isNumber'

import HelpPin from '../../components/HelpPin'
import Spinner from '../../components/Spinner'
import PrefixSetter from '../../components/PrefixSetter'
import CardsList from '../../components/CardsList'
import KnownPageCard from '../../components/KnownPages/KnownPageCard'
import { longestMatching, urlToLru, lruVariations } from '../../utils/lru'
import jsonrpc from '../../utils/jsonrpc'

import './InModal.styl'

// eslint-disable-next-line no-unused-vars
const compareWithWww = (lru) => {
  return (url) => {
    const urlLru = url.lru.split(/\|h:(.+)/)[1] || ''
    const lruLru = lru.split(/\|h:(.+)/)[1] || ''
    return urlLru.startsWith(lruLru)
  }
}

const compareWithoutWww = (lru) => {
  const lrus = lruVariations(lru)
  return (url) => {
    const urlLrus = lruVariations(url.lru)
    return urlLrus.some(urlVariation => {
      return lrus.some(lruVariation => {
        return urlVariation.startsWith(lruVariation)
      })
    })
  }
}

const parsePrefixes = (lruLru, url, tldTree) => {
  const urlLru = urlToLru(url, tldTree)
  if (!urlLru) {
    return url
  }

  if (!lruLru) {
    return url
  }

  let prefixes = [{ name: urlLru.scheme, editable: false, min: 's' }]

  if (urlLru.port && urlLru.port !== '80') {
    prefixes.push({
      name: urlLru.port,
      editable: false,
      min: 't'
    })
  }

  if (urlLru.tld) {
    prefixes.push({
      name: urlLru.tld,
      editable: false,
      min: 'h'
    })
  }

  prefixes = prefixes.concat(urlLru.host.map((host, index) => ({ name: host, editable: index !== 0, min: 'h' })))
  prefixes = prefixes.concat(urlLru.path.map(path => ({ name: path, editable: true, min: 'p' })))

  if (urlLru.query) {
    prefixes.push({
      name: urlLru.query,
      editable: true,
      min: 'q',
    })
  }
  if (urlLru.fragment) {
    prefixes.push({
      name: urlLru.fragment,
      editable: true,
      min: 'f',
    })
  }

  return prefixes
}

const PagesList = ({
  selectedPage,
  setSelectedPage,
  pages,
}) => (
  <CardsList>
    { pages.length ? pages.map((link, index) => {
      return (
        <KnownPageCard
          isActive={ index === selectedPage } onClick={ () => setSelectedPage(index) } key={ index } { ...link }
          displayHomePageButton={ false }
        />
      )
    }) : 'No links to display' }
  </CardsList>
)

const Prefixes = (props) => {
  return (
    <React.Fragment>
      <div className="prefixx@-input-container">
        <PrefixSetter parts={ props.prefixes } setPrefix={ props.onSetPrefixes } />
        <ul className="actions-container">
          {/*step > 1*/}
          <li>
            <button
              disabled={ props.disable || props.existingPrefixes }
              onClick={ props.onValidate }
              className='btn btn-success'
            >{props.loading ? <Spinner /> : 'confirm'}</button></li>
        </ul>
      </div>
      {props.existingPrefixes &&
        <div className="form-error">
          There is already a webentity with this URL scope in your corpus
        </div>
      }
    </React.Fragment>
  )
}

const prefixReducer = (state, action) => {
  switch (action.type) {
  case 'ERROR':
    return { ...state, error: true, loading: false }
  case 'SET':
    return {
      ...state,
      selected: action.payload,
      loading: false,
    }
  case 'LOADING':
    return {
      ...state,
      loading: true
    }
  }
}

const EntityModal = ({
  isOpen,
  onRequestClose,
  onSuccess,
  webentity,
  url,
  corpus_id,
  tabUrl,
  tlds,
}) => {
  const longestLru = longestMatching(webentity.prefixes, tabUrl, tlds).lru
  const prefixes = parsePrefixes(longestLru, tabUrl, tlds)
  const [step, setStep] = useState(1)
  const [selectedPage, setSelectedPage] = useState(null)
  const [name, setName] = useState(webentity.name)
  const withPreviousTags = false
  const totalStepsNumber = withPreviousTags ? 4 : 3

  const onSubmit = useCallback(() => onSuccess(webentity), [])

  const [prefixState, dispatch] = useReducer(prefixReducer, {
    selected: React.useMemo(() => prefixes
      .filter(({ editable }) => !editable)
      .reduce((prev, part) => `${prev}${part.min}:${part.name}|`, '')),
    loadding: false,
    error: false,
  })

  const onSetPrefixes = useCallback((prefix) => {
    if (prefix === prefixState.selected) {
      return
    }
    dispatch({ type: 'LOADING' })
    jsonrpc(url)('store.get_lru_definedprefixes', {
      lru: prefix,
      corpus: corpus_id
    }).catch(() => dispatch({ type: 'ERROR' })).then(matchingWebentities => {
      if (matchingWebentities.filter(({ id }) => webentity.id !== id).length) {
        return dispatch({ type: 'ERROR' })
      }
      dispatch({ type: 'SET', payload: prefix })
      setStep(1)
    })
  }, [prefixState])

  const ndLock = !(step === 2 && isNumber(selectedPage))
  const ref = React.useRef(null)
  const onNameConfirm = useCallback(() => {
    if (ref.current.value.length) {
      setName(ref.current.value)
      setStep(4)
    }
  }, [])
  const onInputChange = useCallback(() => {
    if (step !== 3) {
      setStep(3)
    }
  }, [step])
  return (
    <Modal
      isOpen={ isOpen }
      onRequestClose={ onRequestClose }
      contentLabel="New entity modal"
    >
      <div className="new-entity-modal-container">
        <div className="modal-header">
          <h2><span>Include a webentity in the corpus</span><i onClick={ onRequestClose } className="ti-close" /></h2>
        </div>
        <div className="modal-body">
          <div className="explanation-text">
              You are about to define a webentity as belonging the corpus. 
            <br />
              Its known webpages will be automatically analyzed by the hyphe server to discover new webentities based on the hyperlinks present in these ones (discovered webentities will be added to the PROSPECTIONS list).
          </div>
          <div className={ cx('step-container') }>
            <h3>Step <span className="step-marker">1/{totalStepsNumber}</span> : define the webentity URL scope <HelpPin place="top">This is the URL address root level from which known pages will be gathered and analyzed by the hyphe server</HelpPin></h3>
            <Prefixes
              prefixes={ prefixes }
              onSetPrefixes={ onSetPrefixes }
              loading={ prefixState.loading }
              existingPrefixes={ prefixState.error }
              disable={ step > 1 }
              onValidate={ () => setStep(2) }
            />
          </div>
          <div className={ cx('step-container', { 'is-disabled': step < 2 }) }>
            <h3 className="step3-title-container">
              <span>Step <span className="step-marker">2/{totalStepsNumber}</span> : choose the webentity homepage <HelpPin place="top">This is the page choosen to display a main URL address for the webentity in lists and visualizations</HelpPin></span>
              <button disabled={ ndLock }  onClick={ () => setStep(3) } className="btn btn-success">confirm</button>
            </h3>
            <PagesList
              pages={ webentity.mostLinked.filter(compareWithoutWww(prefixState.selected)) }
              selectedPage={ selectedPage }
              setSelectedPage={ useCallback((index) => {
                setSelectedPage(index)
                if (step > 2) {
                  setStep(2)
                }
              }, [setSelectedPage, step]) }
            />
            <li className="standalone-confirm-container">
              <button disabled={ ndLock }  onClick={ () => setStep(3) } className="btn btn-success">confirm</button>
            </li>
          </div>
          <div className={ cx('step-container', { 'is-disabled': step < 3 }) }>
            <h3>Step <span className="step-marker">3/{ totalStepsNumber }</span> : check the webentity name <HelpPin  place="top">This is the name that will be displayed in the lists and visualizations related to the corpus</HelpPin></h3>
            <div className="name-input-container">
              <input
                className="input"
                ref={ ref }
                defaultValue={ name }
                onChange={ onInputChange }
              />
              <ul className="actions-container">
                <li><button disabled={ step !== 3 }  onClick={ onNameConfirm } className="btn btn-success">confirm</button></li>
              </ul>
            </div>
          </div>
          {
            totalStepsNumber === 4 &&
            <div className={ cx('step-container', { 'is-disabled': step < 4 }) }>
              <h3>Step <span className="step-marker">4/{totalStepsNumber}</span> : set creation settings <HelpPin  place="top">Additional settings for creation</HelpPin></h3>
              <form className="settings-container">
                <ul >
                  <li>
                    <input id="copy-tags" type="checkbox" /><label htmlFor="copy-tags">Copy existing tags</label>
                  </li>
                  <li>
                    <input id="copy-notes" type="checkbox" /><label htmlFor="copy-notes">Copy existing notes</label>
                  </li>
                </ul>
              </form>
            </div>
          }
        </div>
        <div className="modal-footer">
          <ul className="actions-container big">
            <li><button onClick={ onRequestClose } className="btn btn-danger">cancel</button></li>
            <li><button onClick={ onSubmit } disabled={ step !== 4 } className="btn btn-success">include webentity and analyze it !</button></li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default EntityModal
