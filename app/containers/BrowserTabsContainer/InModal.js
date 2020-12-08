import React, { useRef, useState, useEffect, useCallback, useReducer, useMemo } from 'react'
import { FormattedMessage , useIntl } from 'react-intl'
import Modal from 'react-modal'
import cx from 'classnames'
import { debounce } from 'lodash'

import { FixedSizeList as List } from 'react-window'
import  AutoSizer from 'react-virtualized-auto-sizer'
import Tooltip from 'react-tooltip'
import isNumber from 'lodash/fp/isNumber'

import HelpPin from '../../components/HelpPin'
import Spinner from '../../components/Spinner'
import PrefixSetter from '../../components/PrefixSetter'
import KnownPageCard from '../../components/KnownPages/KnownPageCard'
import BodyTooltip from '../../components/BodyTooltip'

import { urlToLru, lruVariations, longestMatching, lruToUrl, lruObjectToString, parsePrefixes } from '../../utils/lru'

import '../../css/entity-modal.styl'

const compareWithoutWww = (lru) => {
  const lrus = lruVariations(lru)
  return (url) =>
    lruVariations(url.lru).some(urlVariation =>
      lrus.some(lruVariation =>
        urlVariation.startsWith(lruVariation)
      )
    )
}

const rebuildTooltip = debounce(() => Tooltip.rebuild(), 200)


const PagesList = ({
  selectedPage,
  setSelectedPage,
  pages,
  isPaginating,
  paginatePages,
  totalPages
}) => {

  const listContainer = useRef(null)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    if (listContainer && listContainer.current) {
      const height = window.getComputedStyle(listContainer.current).getPropertyValue('max-height').replace('px', '')
      setContainerHeight(parseInt(height))
      rebuildTooltip()
    }
  })

  const Row = ({ index, style }) => {
    const link = pages[index]
    return (
      <div style={ style }>
        <KnownPageCard
          key={ index }
          isActive={ index === selectedPage }
          onClick={ () => setSelectedPage(index) }
          { ...link }
          displayHomePageButton={ false }
        />
      </div>
    )
  }

  return (
    <div className="pages-list">
      <ul className="pages-container" ref={ listContainer }>
        <AutoSizer disableHeight onResize={ rebuildTooltip }>
          {({ width }) => (
            <List
              height={ (pages.length * 46 < containerHeight) ? pages.length * 46 : containerHeight }
              width={ width }
              onScroll={ rebuildTooltip }
              itemCount={ pages.length }
              itemSize={ 46 } // check stylesheet
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </ul>
      {
        isPaginating &&
        <div className="pages-list-loader">
          <FormattedMessage id="loading" />
          <span> ({ paginatePages } / { totalPages } webpages)</span>
        </div>
      }
      <BodyTooltip />
    </div>
  )
}

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
              disabled={ props.disable }
              onClick={ props.onValidate }
              className='btn btn-success'
            ><FormattedMessage id="in-modale.confirm" /></button></li>
        </ul>
      </div>
    </React.Fragment>
  )
}

const orderList = (pages, prefix, tabLru) => {
  if (pages) {
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
    pages.filter(compareWithoutWww(prefix)).sort((linkA, linkB) =>
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
      step: 1,
      selectedPage: null,
    }
  case 'SET_NAME':
    return {
      ...state,
      name: action.payload,
    }
  case 'VALIDATE_NAME':
    return {
      ...state,
      step: 4,
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
    () => longestMatching(webentity.prefixes, tabUrl, tlds) && longestMatching(webentity.prefixes, tabUrl, tlds).lru,
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
      loading: false,
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
    () => orderList(webentity.paginatePages, state.prefix, lruObjectToString(urlToLru(tabUrl, tlds))),
    [webentity.paginatePages, state.prefix, tlds, tabUrl]
  )

  const onSubmit = useCallback(() => {
    dispatch({
      type: 'LOADING',
    })
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
  }, [state])

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
      dispatch({ type: 'VALIDATE_NAME', payload: nameRef.current.value })
    }
  }, [])
  const onInputChange = useCallback((e) => {
    dispatch({ type: 'SET_NAME', payload: e.target.value })
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

  const handleKeyUp = (e) => {
    if (e.keyCode === 13) { // ENTER
      onNameConfirm()
    }
  }

  return (
    <Modal
      isOpen={ isOpen }
      onRequestClose={ onRequestClose }
      style={ customStyles }
      contentLabel="New entity modal"
    >
      <div className="new-entity-modal-container">
        {state.loading && (
          <div className="modal--spiner-conainer">
            <Spinner />
          </div>
        )}
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
              <span className="step-marker">1/{totalStepsNumber}</span> <FormattedMessage id="in-modale.title-step-1" /><HelpPin place="top">{formatMessage({ id: 'in-modale.tooltip-step-1' })}</HelpPin>
            </h3>
            <Prefixes
              prefixes={ prefixes }
              onSetPrefixes={ onSetPrefixes }
              disable={ state.step > 1 }
              onValidate={ () => dispatch({ type: 'SET_STEP', payload: 2 }) }
            />
          </div>
          <div className={ cx('step-container', { 'is-disabled': state.step < 2 }) }>
            <h3 className="step3-title-container">
              <span><span className="step-marker">2/{totalStepsNumber}</span> <FormattedMessage id="in-modale.title-step-2" /> <HelpPin place="top">{formatMessage({ id: 'in-modale.tooltip-step-2' })}</HelpPin></span>
              <button disabled={ ndLock }  onClick={ () => dispatch({ type: 'SET_STEP', payload: 3 }) } className="btn btn-success"><FormattedMessage id="in-modale.confirm" /></button>
            </h3>
            {
              webentity.paginatePages ?
                <PagesList
                  pages={ pagesList }
                  isPaginating={ webentity.token }
                  paginatePages={ webentity.paginatePages.length }
                  totalPages={ webentity.pages_total }
                  selectedPage={ state.selectedPage }
                  setSelectedPage={ setPage }
                /> : <Spinner />
            }
            <li className="standalone-confirm-container">
              <button disabled={ ndLock } onClick={ () => dispatch({ type: 'SET_STEP', payload: 3 }) } className="btn btn-success"><FormattedMessage id="in-modale.confirm" /></button>
            </li>
          </div>
          <div className={ cx('step-container', { 'is-disabled': state.step < 3 }) }>
            <h3>
              <span className="step-marker">3/{ totalStepsNumber }</span> { createNewEntity ? <FormattedMessage id="in-modale.title-step-3-add" /> : <FormattedMessage id="in-modale.title-step-3-in" /> }<HelpPin place="top">{formatMessage({ id: 'in-modale.tooltip-step-3' })}</HelpPin>
            </h3>
            <div className="name-input-container">
              <input
                className="input"
                ref={ nameRef }
                defaultValue={ state.name }
                onChange={ onInputChange }
                onKeyUp= { handleKeyUp }
              />
              <ul className="actions-container">
                <li><button disabled={ state.step !== 3 || !state.name }  onClick={ onNameConfirm } className="btn btn-success"><FormattedMessage id="in-modale.confirm" /></button></li>
              </ul>
            </div>
          </div>
          {
            totalStepsNumber === 4 &&
            <div className={ cx('step-container', { 'is-disabled': state.step < 4 }) }>
              <h3>
                <span className="step-marker">4/{totalStepsNumber}</span> <FormattedMessage id="in-modale.title-step-4" /><HelpPin  place="top">{formatMessage({ id: 'in-modale.tooltip-step-4' })}</HelpPin>
              </h3>
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
