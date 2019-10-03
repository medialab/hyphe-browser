import React from 'react'
import Modal from 'react-modal'
import cx from 'classnames'

import isNumber from 'lodash/fp/isNumber'

import HelpPin from '../../components/HelpPin'
import PrefixSetter from '../../components/PrefixSetter'
import CardsList from '../../components/CardsList'
import KnownPageCard from '../../components/KnownPages/KnownPageCard'

import './InModal.styl'

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

const EntityModal = ({
  isOpen,
  onRequestClose,
  onSuccess,
  setSelectPage,
  selectedPage,
  currentStep = 1,
  setCurrentStep,
  withPreviousTags,
  withExistingPrefix,
  webentity,
  prefix,
  onSetPrefix,
  defaultName,
  setName
}) => {
  const totalStepsNumber = withPreviousTags ? 4 : 3
  const onSetPrefixCallback = React.useCallback((prefix) => {
    onSetPrefix(prefix)
    setCurrentStep(1)
  }, [])
  let ndLock = true
  if (currentStep === 2) {
    if (isNumber(selectedPage)) {
      ndLock = false
    }
  }
  const ref = React.useRef(null)
  const onNameConfirm = React.useCallback(() => {
    if (ref.current.value.length) {
      setName(ref.current.value)
      setCurrentStep(4)
    }
  }, [])
  const onInputChange = React.useCallback(() => {
    if (currentStep !== 3) {
      setCurrentStep(3)
    }
  }, [currentStep])

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
            <div className="prefix-input-container">
              <PrefixSetter parts={ prefix } setPrefix={ onSetPrefixCallback } />
              <ul className="actions-container">
                <li><button disabled={ currentStep > 1 || withExistingPrefix } onClick={ () => setCurrentStep(2) } className="btn btn-success">confirm</button></li>
              </ul>
            </div>
            {withExistingPrefix &&
              <div className="form-error">
                There is already a webentity with this URL scope in your corpus
              </div>
            }
          </div>
          <div className={ cx('step-container', { 'is-disabled': currentStep < 2 }) }>
            <h3 className="step3-title-container">
              <span>Step <span className="step-marker">2/{totalStepsNumber}</span> : choose the webentity homepage <HelpPin place="top">This is the page choosen to display a main URL address for the webentity in lists and visualizations</HelpPin></span>
              <button disabled={ ndLock }  onClick={ () => setCurrentStep(3) } className="btn btn-success">confirm</button>
            </h3>
            <PagesList
              pages={ webentity.mostLinked }
              selectedPage={ selectedPage }
              setSelectedPage={ React.useCallback((index) => {
                setSelectPage(index)
                if (currentStep > 2) {
                  setCurrentStep(2)
                }
              }, [setSelectPage, currentStep]) }
            />
            <li className="standalone-confirm-container">
              <button disabled={ ndLock }  onClick={ () => setCurrentStep(3) } className="btn btn-success">confirm</button>
            </li>
          </div>
          <div className={ cx('step-container', { 'is-disabled': currentStep < 3 }) }>
            <h3>Step <span className="step-marker">3/{ totalStepsNumber }</span> : check the webentity name <HelpPin  place="top">This is the name that will be displayed in the lists and visualizations related to the corpus</HelpPin></h3>
            <div className="name-input-container">
              <input
                className="input"
                ref={ ref }
                defaultValue={ defaultName }
                onChange={ onInputChange }
              />
              <ul className="actions-container">
                <li><button disabled={ currentStep !== 3 }  onClick={ onNameConfirm } className="btn btn-success">confirm</button></li>
              </ul>
            </div>
          </div>
          {
            totalStepsNumber === 4 &&
            <div className={ cx('step-container', { 'is-disabled': currentStep < 4 }) }>
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
            <li><button onClick={ () => onSuccess(webentity) } disabled={ currentStep !== 4 } className="btn btn-success">include webentity and analyze it !</button></li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default EntityModal
