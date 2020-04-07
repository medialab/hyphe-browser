import React, { useRef, useEffect, useCallback, useReducer, useMemo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import Modal from 'react-modal'
import cx from 'classnames'

import isNumber from 'lodash/fp/isNumber'
import initial from 'lodash/fp/initial'
import dropRightWhile from 'lodash/fp/dropRightWhile'

import HelpPin from '../../components/HelpPin'
import Spinner from '../../components/Spinner'
import PrefixSetter from '../../components/PrefixSetter'
import CardsList from '../../components/CardsList'
import KnownPageCard from '../../components/KnownPages/KnownPageCard'
import { urlToLru, lruVariations, longestMatching, lruToUrl, lruObjectToString } from '../../utils/lru'

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
    }) : <FormattedMessage id="in-modale.no-links" /> }
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
              disabled={ props.disable || props.loading }
              onClick={ props.onValidate }
              className='btn btn-success'
            ><FormattedMessage id="in-modale.confirm" /></button></li>
        </ul>
      </div>
    </React.Fragment>
  )
}

const parsePrefixes = (lru, url, newEntity, tldTree) => {
  const urlLru = lruObjectToString(urlToLru(url, tldTree))
  const l = lru.split('|').length
  return dropRightWhile((stem) => stem === 'p:', initial(urlLru.split('|'))).map((stem, index) => {
    const editable = newEntity ? index >= l : index >= l - 1
    return {
      name: stem,
      editable,
      selected: index < l - 1 || newEntity,
    }
  })
}

const orderList = (mostLinked, prefix, tabLru) => {
  console.log(prefix, tabLru, mostLinked)
  if (mostLinked) {
    return [tabLru, prefix].reduce((accumulator, value) => {
      if (!accumulator.some(({ lru }) => lru === value)) {
        return [
          {
            url: lruToUrl(value),
            crawled: null,
            lru: value,
            linked: null,
          },
          ...accumulator
        ]
      } else {
        return accumulator
      }
    },
    mostLinked.filter(compareWithoutWww(prefix)).sort((linkA, linkB) => 
      linkA.url.length - linkB.url.length || linkA.url.localeCompare(linkB.lru)
    ))
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
      step: 1,
      selectedPage: null,
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
  createNewEntity,
  tabUrl,
  tlds,
}) => {
  const { formatMessage } = useIntl()
  const longestLru = useMemo(
    () => longestMatching(webentity.prefixes, tabUrl, tlds).lru,
    [webentity.prefixes, tabUrl, tlds]
  )
  const prefixes = useMemo(
    () => parsePrefixes(lruObjectToString(longestLru), tabUrl, createNewEntity, tlds),
    [longestLru, tabUrl, createNewEntity, tlds]
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
      name: createNewEntity ? '' : webentity.name,
      prefix: initialPrefix,
      loadding: false,
      error: false,
      tags: true,
      notes: true
    }
  )

  const prefixHasChanged = initialPrefix !== state.prefix
  const hasTags = !!(webentity.tags.USER && Object.keys(webentity.tags.USER).length)
  const showCopyStep = (prefixHasChanged || createNewEntity) && hasTags
  const totalStepsNumber = showCopyStep ? 4 : 3

  const pagesList = useMemo(
    () => orderList(webentity.mostLinked, state.prefix, lruObjectToString(urlToLru(tabUrl, tlds))),
    [webentity.mostLinked, state.prefix, tlds, tabUrl]
  )

  const onSubmit = useCallback(() =>
    onSuccess(webentity, {
      prefix: state.prefix,
      homepage: pagesList[state.selectedPage].url,
      name: state.name,
      crawl: true,
      copy: {
        tags: showCopyStep && state.tags,
        notes: showCopyStep && state.notes
      },
    })
  , [state])

  const onSetPrefixes = useCallback((prefix) => {
    if (prefix === state.prefix) {
      return
    }
    dispatch({ type: 'SET_PREFIX', payload: prefix })
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
  const setPage = useCallback((index) => dispatch({ type: 'SET_PAGE', payload: index }))
  const validatestags = useCallback(() => dispatch({ type: 'SET_STEP', payload: 5 }))

  const modalBody = useRef()
  useEffect(() => {
    if (modalBody.current) {
      const element = modalBody.current.querySelector(`.step-container:nth-child(${state.step + 1})`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
      }
    }
  }, [state.step])

  return (
    <Modal
      isOpen={ isOpen }
      onRequestClose={ onRequestClose }
      style={ customStyles }
      contentLabel="New entity modal"
    >
      <div className="new-entity-modal-container">
        <div className="modal-header">
          <h2><span>{ createNewEntity ? <FormattedMessage id="browse-create" /> : <FormattedMessage id="in-modale.title-in" /> }</span><i onClick={ onRequestClose } className="ti-close" /></h2>
        </div>
        <div className="modal-body" ref={ modalBody }>
          <div className="explanation-text">
            {createNewEntity ? <FormattedMessage id="in-modale.explanation-text-first-add" /> : <FormattedMessage id="in-modale.explanation-text-first-in" />}
            <br />
            <FormattedMessage id="in-modale.explanation-text-base" />
          </div>
          <div className={ cx('step-container') }>
            <h3>
              <FormattedMessage id="in-modale.step" />
              <span className="step-marker">1/{totalStepsNumber}</span> : <FormattedMessage id="in-modale.title-step-1" /><HelpPin place="top">{formatMessage({ id: 'in-modale.tooltip-step-1' })}</HelpPin>
            </h3>
            <Prefixes
              prefixes={ prefixes }
              onSetPrefixes={ onSetPrefixes }
              loading={ state.loading }
              disable={ state.step > 1 }
              onValidate={ () => dispatch({ type: 'SET_STEP', payload: 2 }) }
            />
          </div>
          <div className={ cx('step-container', { 'is-disabled': state.step < 2 }) }>
            <h3 className="step3-title-container">
              <span><FormattedMessage id="in-modale.step" /><span className="step-marker">2/{totalStepsNumber}</span> : <FormattedMessage id="in-modale.title-step-2" /> <HelpPin place="top">{formatMessage({ id: 'in-modale.tooltip-step-2' })}</HelpPin></span>
              <button disabled={ ndLock }  onClick={ () => dispatch({ type: 'SET_STEP', payload: 3 }) } className="btn btn-success"><FormattedMessage id="in-modale.confirm" /></button>
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
              <button disabled={ ndLock } onClick={ () => dispatch({ type: 'SET_STEP', payload: 3 }) } className="btn btn-success"><FormattedMessage id="in-modale.confirm" /></button>
            </li>
          </div>
          <div className={ cx('step-container', { 'is-disabled': state.step < 3 }) }>
            <h3><FormattedMessage id="in-modale.step" /> <span className="step-marker">3/{ totalStepsNumber }</span> : { createNewEntity ? <FormattedMessage id="in-modale.title-step-3-add" /> : <FormattedMessage id="in-modale.title-step-3-in" /> }<HelpPin place="top">{formatMessage({ id: 'in-modale.tooltip-step-3' })}</HelpPin></h3>
            <div className="name-input-container">
              <input
                className="input"
                ref={ nameRef }
                defaultValue={ state.name }
                onChange={ onInputChange }
              />
              <ul className="actions-container">
                <li><button disabled={ state.step !== 3 }  onClick={ onNameConfirm } className="btn btn-success"><FormattedMessage id="in-modale.confirm" /></button></li>
              </ul>
            </div>
          </div>
          {
            totalStepsNumber === 4 &&
            <div className={ cx('step-container', { 'is-disabled': state.step < 4 }) }>
              <h3><FormattedMessage id="in-modale.step" /> <span className="step-marker">4/{totalStepsNumber}</span> : <FormattedMessage id="in-modale.title-step-4" /><HelpPin  place="top">{formatMessage({ id: 'in-modale.tooltip-step-4' })}</HelpPin></h3>
              <form className="settings-container">
                <ul >
                  <li>
                    <input defaultChecked onChange={ (event) => dispatch({ type: 'SET_TAGS', payload: event.target.checked }) } id="copy-tags" type="checkbox" /><label htmlFor="copy-tags"><FormattedMessage id="in-modale.copy-tags" /></label>
                  </li>
                  <li>
                    <input defaultChecked onChange={ (event) => dispatch({ type: 'SET_NOTES', payload: event.target.checked }) } id="copy-notes" type="checkbox" /><label htmlFor="copy-notes"><FormattedMessage id="in-modale.copy-notes" /></label>
                  </li>
                </ul>
                <ul className="actions-container">
                  <li className="standalone-confirm-container">
                    <button disabled={ state.step !== 4 } onClick={ validatestags } className="btn btn-success"><FormattedMessage id="in-modale.confirm" /></button>
                  </li>
                </ul>
              </form>
            </div>
          }
        </div>
        <div className="modal-footer">
          <ul className="actions-container big">
            <li>
              <button
                onClick={ onRequestClose }
                className="btn btn-danger"
              ><FormattedMessage id="cancel" /></button>
            </li>
            <li>
              <button
                onClick={ onSubmit }
                disabled={ state.step !== totalStepsNumber + 1 }
                className="btn btn-success"
              >
                {createNewEntity ? <FormattedMessage id="in-modale.confirm-modale-add" /> : <FormattedMessage id="in-modale.confirm-modale-in" />}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default EntityModal
