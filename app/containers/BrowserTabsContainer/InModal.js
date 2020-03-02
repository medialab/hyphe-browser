import React, { useState, useCallback, useReducer, useMemo } from 'react'
import Modal from 'react-modal'
import cx from 'classnames'

import isNumber from 'lodash/fp/isNumber'
import head from 'lodash/fp/head'

import HelpPin from '../../components/HelpPin'
import Spinner from '../../components/Spinner'
import PrefixSetter from '../../components/PrefixSetter'
import CardsList from '../../components/CardsList'
import KnownPageCard from '../../components/KnownPages/KnownPageCard'
import { urlToLru, lruVariations, lruToUrl, parseLru } from '../../utils/lru'
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

const parsePrefixes = (lruString, url, newEntity, tldTree) => {
  const urlLru = urlToLru(url, tldTree)
  const lruLru = parseLru(lruString, tldTree)

  let prefixes = [{ name: urlLru.scheme, editable: false, selected: true, min: 's' }]

  if (urlLru.port && urlLru.port !== '80') {
    prefixes.push({
      name: urlLru.port,
      editable: false,
      selected: true,
      min: 't'
    })
  }

  if (urlLru.tld) {
    prefixes.push({
      name: urlLru.tld,
      editable: false,
      selected: true,
      min: 'h'
    })
  }

  prefixes = prefixes.concat(urlLru.host.map((host) => {
    const included = lruLru.host.includes(host)
    return {
      name: host,
      editable: !included,
      selected: !included || newEntity,
      min: 'h'
    }
  }))
  prefixes = prefixes.concat(urlLru.path.map(path => {
    const included = lruLru.path.includes(path)
    return {
      name: path,
      editable: !included,
      selected: !included || newEntity,
      min: 'p'
    }
  }))

  if (urlLru.query) {
    prefixes.push({
      name: urlLru.query,
      editable: true,
      selected: newEntity,
      min: 'q',
    })
  }
  if (urlLru.fragment) {
    prefixes.push({
      name: urlLru.fragment,
      editable: true,
      selected: newEntity,
      min: 'f',
    })
  }

  if (newEntity) {
    for (let index = 0; index < prefixes.length; index++) {
      const element = prefixes[index]
      if (element.editable === true) {
        element.editable = false
        break
      }
    }
  }

  return prefixes
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

const useOrderLists = (mostLinked, prefix) => {
  if (mostLinked) {
    const filtered = mostLinked.filter(compareWithoutWww(prefix))
    const foundUrl = filtered.find(link => {
      return link.lru === prefix
    })
    if (foundUrl) {
      const index = filtered.indexOf(foundUrl)
      if (index > -1) {
        filtered.splice(index, 1)
      }
      return [
        foundUrl,
        ...filtered
      ]
    }
    return [
      {
        url: lruToUrl(prefix),
        crawled: null,
        lru: prefix,
        linked: null,
      },
      ...filtered
    ]
  } else {
    return []
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
  const longestLru = useMemo(() => head(webentity.prefixes.sort((a, b) => b.length - a.length)), webentity.prefixes)
  const prefixes = useMemo(() => parsePrefixes(longestLru, tabUrl, comeFromPlus, tlds), [longestLru, tabUrl, comeFromPlus, tlds])
  const [step, setStep] = useState(1)
  const [selectedPage, setSelectedPage] = useState(null)
  const [name, setName] = useState(webentity.name)
  const initialSelected = useMemo(() => prefixes
    .filter(({ editable }) => !editable)
    .reduce((prev, part) => `${prev}${part.min}:${part.name}|`, ''))

  const [prefixState, dispatch] = useReducer(prefixReducer, {
    selected: initialSelected,
    loadding: false,
    error: false,
  })
  const prefixHasChanged = initialSelected !== prefixState.selected
  const hasTags = !!(webentity.tags.USER && Object.keys(webentity.tags.USER).length)
  const showCopyStep = (prefixHasChanged || comeFromPlus) && hasTags
  const totalStepsNumber = showCopyStep ? 4 : 3
  const [copyTags, setCopyTags] = useState({ tags: true, notes: true })

  const pagesList = useMemo(
    () => useOrderLists(webentity.mostLinked, prefixState.selected),
    [webentity.mostLinked, prefixState.selected]
  )

  const onSubmit = useCallback(() => {
    onSuccess(webentity, {
      prefix: prefixState.selected,
      homepage: pagesList[selectedPage].url,
      name,
      crawl: true,
      copy: copyTags,
    })
  }, [prefixState, selectedPage, name, pagesList, copyTags])

  const onSetPrefixes = useCallback((prefix) => {
    if (prefix === prefixState.selected) {
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
  const setPage = useCallback((index) => {
    setSelectedPage(index)
    if (step > 2) {
      setStep(2)
    }
  }, [setSelectedPage, step])
  const validatesCopyTags = useCallback(() => {
    setStep(5)
  })
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
            {
              webentity.mostLinked ? 
                <PagesList
                  pages={ pagesList }
                  selectedPage={ selectedPage }
                  setSelectedPage={ setPage }
                /> : <Spinner />
            }
            <li className="standalone-confirm-container">
              <button disabled={ ndLock } onClick={ () => setStep(3) } className="btn btn-success">confirm</button>
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
                    <input checked={ copyTags.tags } onChange={ (event) => setCopyTags({ ...copyTags, tags: event.target.checked }) } id="copy-tags" type="checkbox" /><label htmlFor="copy-tags">Copy existing tags</label>
                  </li>
                  <li>
                    <input checked={ copyTags.notes } onChange={ (event) => setCopyTags({ ...copyTags, notes: event.target.checked }) } id="copy-notes" type="checkbox" /><label htmlFor="copy-notes">Copy existing notes</label>
                  </li>
                </ul>
                <ul className="actions-container">
                  <li className="standalone-confirm-container">
                    <button disabled={ step !== 4 }  onClick={ validatesCopyTags } className="btn btn-success">confirm</button>
                  </li>
                </ul>
              </form>
            </div>
          }
        </div>
        <div className="modal-footer">
          <ul className="actions-container big">
            <li><button onClick={ onRequestClose } className="btn btn-danger">cancel</button></li>
            <li><button onClick={ onSubmit } disabled={ step !== totalStepsNumber + 1 } className="btn btn-success">include webentity and analyze it !</button></li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default EntityModal
