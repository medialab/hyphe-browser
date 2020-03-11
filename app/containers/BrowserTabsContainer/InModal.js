import React, { useCallback, useReducer, useMemo } from 'react'
import Modal from 'react-modal'
import cx from 'classnames'

import isNumber from 'lodash/fp/isNumber'
import initial from 'lodash/fp/initial'

import HelpPin from '../../components/HelpPin'
import Spinner from '../../components/Spinner'
import PrefixSetter from '../../components/PrefixSetter'
import CardsList from '../../components/CardsList'
import KnownPageCard from '../../components/KnownPages/KnownPageCard'
import { urlToLru, lruVariations, longestMatching, lruToUrl, lruObjectToString } from '../../utils/lru'
import jsonrpc from '../../utils/jsonrpc'

import './InModal.styl'

const compareWithoutWww = (lru) => {
  const lrus = lruVariations(lru)
  return (url) => 
    lruVariations(url.lru).some(urlVariation =>
      lrus.some(lruVariation =>
        urlVariation.startsWith(lruVariation)
      )
    )
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
      <div className="prefix-input-container">
        <PrefixSetter
          parts={ props.prefixes }
          setPrefix={ props.onSetPrefixes }
        />
        <ul className="actions-container">
          <li>
            <button
              disabled={ props.disable || props.existingPrefixes || props.loading }
              onClick={ props.onValidate }
              className='btn btn-success'
            >confirm</button></li>
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

const parsePrefixes = (lru, url, newEntity, tldTree) => {
  const urlLru = lruObjectToString(urlToLru(url, tldTree))
  const l = lru.split('|').length
  return initial(urlLru.split('|')).map((stem, index) => {
    const editable = newEntity ? index >= l : index >= l - 1
    return {
      name: stem,
      editable,
      selected: index < l - 1 || newEntity,
    }
  })
}

const orderList = (mostLinked, prefix) => {
  if (mostLinked) {
    let found = false
    const filtered = mostLinked.filter(compareWithoutWww(prefix)).sort((linkA, linkB) => {
      if (linkB.lru === prefix) {
        found = true
        return 1
      }
      return linkA.url.length - linkB.url.length || linkA.url.localeCompare(linkB.lru)
    })
    if (!found) { 
      return [
        {
          url: lruToUrl(prefix),
          crawled: null,
          lru: prefix,
          linked: null,
        },
        ...filtered
      ]
    }
    return filtered
  } else {
    return []
  }
}

const modalReducer = (state, action) => {
  switch (action.type) {
  case 'ERROR':
    return { ...state, error: true, loading: false }
  case 'SET_PREFIX':
    return {
      ...state,
      prefix: action.payload,
      loading: false,
      step: 1
    }
  case 'SET_NAME':
    return {
      ...state,
      name: action.payload,
      step: 4
    }
  case 'SET_PAGE':
    return {
      ...state,
      selectedPage: action.payload,
      step: state.step > 2 ? 2 : state.step,
    }
  case 'SET_STEP':
    return {
      ...state,
      step: action.payload
    }
  case 'SET_TAGS':
    return {
      ...state,
      tags: action.payload
    }
  case 'SET_NOTES':
    return {
      ...state,
      notes: action.payload
    }
  case 'LOADING':
    return {
      ...state,
      loading: true
    }
  }
  return state
}

const customStyles = {
  content: {
    padding: 0,
    top: 60,
  }
}

const EntityModal = ({
  isOpen,
  onRequestClose,
  onSuccess,
  webentity,
  url,
  corpusId,
  tabUrl,
  tlds,
}) => {
  const comeFromPlus = webentity.status !== 'DISCOVERED'
  const longestLru = useMemo(
    () => longestMatching(webentity.prefixes, tabUrl, tlds).lru,
    [webentity.prefixes, tabUrl, tlds]
  )
  const prefixes = useMemo(
    () => parsePrefixes(lruObjectToString(longestLru), tabUrl, comeFromPlus, tlds),
    [longestLru, tabUrl, comeFromPlus, tlds]
  )
  const initialPrefix = useMemo(
    () => prefixes
      .filter(({ selected }) => selected)
      .reduce((prev, part) => `${prev}${part.name}|`, '')
  )

  const [state, dispatch] = useReducer(
    modalReducer,
    {
      step: 1,
      selectedPage: null,
      name: webentity.name,
      prefix: initialPrefix,
      loadding: false,
      error: false,
      tags: true,
      notes: true
    }
  )

  const prefixHasChanged = initialPrefix !== state.prefix
  const hasTags = !!(webentity.tags.USER && Object.keys(webentity.tags.USER).length)
  const showCopyStep = (prefixHasChanged || comeFromPlus) && hasTags
  const totalStepsNumber = showCopyStep ? 4 : 3

  const pagesList = useMemo(
    () => orderList(webentity.mostLinked, state.prefix),
    [webentity.mostLinked, state.prefix]
  )

  const onSubmit = useCallback(() => {
    onSuccess(webentity, {
      prefix: state.prefix,
      homepage: pagesList[state.selectedPage].url,
      name: state.name,
      crawl: true,
      copy: {
        tags: state.tags,
        notes: state.notes
      },
    })
  }, [state])

  const onSetPrefixes = useCallback((prefix) => {
    if (prefix === state.prefix) {
      return
    }
    dispatch({ type: 'LOADING' })
    jsonrpc(url)('store.get_lru_definedprefixes', {
      lru: prefix,
      corpus: corpusId
    }).catch(() => dispatch({ type: 'ERROR' })).then(matchingWebentities => {
      const webentityExists = matchingWebentities
        .filter(({ id, lru }) =>
          webentity.id !== id && webentity.prefixes.includes(lru)
        ).length
      if (webentityExists) {
        return dispatch({ type: 'ERROR' })
      }
      dispatch({ type: 'SET_PREFIX', payload: prefix })
    })
  }, [state.prefix])

  const ndLock = state.step !== 2 || !isNumber(state.selectedPage)
  const nameRef = React.useRef(null)
  const onNameConfirm = useCallback(() => {
    if (nameRef.current.value.length) {
      dispatch({ type: 'SET_NAME', payload: nameRef.current.value })
    }
  }, [])
  const onInputChange = useCallback(() => {
    if (state.step !== 3) {
      dispatch({ type: 'SET_STEP', payload: 3 })
    }
  }, [state.step])
  const setPage = useCallback((index) => {
    dispatch({
      type: 'SET_PAGE',
      payload: index,
    })
  }, [state.step])
  const validatestags = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: 5 })
  })
  return (
    <Modal
      isOpen={ isOpen }
      onRequestClose={ onRequestClose }
      style={ customStyles }
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
              loading={ state.loading }
              existingPrefixes={ state.error }
              disable={ state.step > 1 }
              onValidate={ () => dispatch({ type: 'SET_STEP', payload: 2 }) }
            />
          </div>
          <div className={ cx('step-container', { 'is-disabled': state.step < 2 }) }>
            <h3 className="step3-title-container">
              <span>Step <span className="step-marker">2/{totalStepsNumber}</span> : choose the webentity homepage <HelpPin place="top">This is the page choosen to display a main URL address for the webentity in lists and visualizations</HelpPin></span>
              <button disabled={ ndLock }  onClick={ () => dispatch({ type: 'SET_STEP', payload: 3 }) } className="btn btn-success">confirm</button>
            </h3>
            {
              webentity.mostLinked ? 
                <PagesList
                  pages={ pagesList }
                  selectedPage={ state.selectedPage }
                  setSelectedPage={ setPage }
                /> : <Spinner />
            }
            <li className="standalone-confirm-container">
              <button disabled={ ndLock } onClick={ () => dispatch({ type: 'SET_STEP', payload: 3 }) } className="btn btn-success">confirm</button>
            </li>
          </div>
          <div className={ cx('step-container', { 'is-disabled': state.step < 3 }) }>
            <h3>Step <span className="step-marker">3/{ totalStepsNumber }</span> : check the webentity name <HelpPin  place="top">This is the name that will be displayed in the lists and visualizations related to the corpus</HelpPin></h3>
            <div className="name-input-container">
              <input
                className="input"
                ref={ nameRef }
                defaultValue={ state.name }
                onChange={ onInputChange }
              />
              <ul className="actions-container">
                <li><button disabled={ state.step !== 3 }  onClick={ onNameConfirm } className="btn btn-success">confirm</button></li>
              </ul>
            </div>
          </div>
          {
            totalStepsNumber === 4 &&
            <div className={ cx('step-container', { 'is-disabled': state.step < 4 }) }>
              <h3>Step <span className="step-marker">4/{totalStepsNumber}</span> : set creation settings <HelpPin  place="top">Additional settings for creation</HelpPin></h3>
              <form className="settings-container">
                <ul >
                  <li>
                    <input defaultChecked onChange={ (event) => dispatch({ type: 'SET_TAGS', payload: event.target.checked }) } id="copy-tags" type="checkbox" /><label htmlFor="copy-tags">Copy existing tags</label>
                  </li>
                  <li>
                    <input defaultChecked onChange={ (event) => dispatch({ type: 'SET_NOTES', payload: event.target.checked }) } id="copy-notes" type="checkbox" /><label htmlFor="copy-notes">Copy existing notes</label>
                  </li>
                </ul>
                <ul className="actions-container">
                  <li className="standalone-confirm-container">
                    <button disabled={ state.step !== 4 }  onClick={ validatestags } className="btn btn-success">confirm</button>
                  </li>
                </ul>
              </form>
            </div>
          }
        </div>
        <div className="modal-footer">
          <ul className="actions-container big">
            <li><button onClick={ onRequestClose } className="btn btn-danger">cancel</button></li>
            <li><button onClick={ onSubmit } disabled={ state.step !== totalStepsNumber + 1 } className="btn btn-success">include webentity and analyze it !</button></li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default EntityModal
