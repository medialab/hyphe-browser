import './EntityModal.styl'
import React, { useState } from 'react'
import Modal from 'react-modal'
import cx from 'classnames'

import HelpPin from '../../app/components/HelpPin'
import PrefixSetter from '../PrefixSetter'
import { KnownPageCard } from '../KnownPagesMock'
import CardsList from '../CardsList'

Modal.setAppElement('#root')



let PAGES = [
  {
    name: 'faceboc',
    homepage: 'https://facebook.com',
    id: 'facebook'
  },
  {
    name: 'toto',
    homepage: 'https://facebook.com/profile/toto',
    id: 'facebook'
  },
  {
    name: 'gilets jaunes',
    homepage: 'https://facebook.com/group/giles jaunes',
    id: 'facebook'
  },
  
]
for (let i = 0 ; i < 3 ; i++) PAGES = PAGES.concat(PAGES)

const PagesList = ({
  selectedPage,
  setSelectedPage
}) => (
  <CardsList>
    { PAGES.length ? PAGES.map((link, index) => {

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
  onToggle,
  onSetSelectedPage,
  currentStep,
  selectedPage,
  setCurrentStep,
  withPreviousTags,
  withExistingPrefix,
}) => {
  const totalStepsNumber = withPreviousTags ? 4 : 3
  return (
    <Modal
      isOpen={ isOpen }
      onRequestClose={ onToggle }
      contentLabel="New entity modal"
      style={ {
        content: {
          width: 700,
          maxWidth: '90vw',
          position: 'relative',
          height: '80vh',
          top: 0,
          left: 0,
          overflow: 'hidden',
          padding: 0
        }
      } }
    >
      <div className="new-entity-modal-container">
        <div className="modal-header">
          <h2><span>Include a webentity in the corpus</span><i onClick={ onToggle } className="ti-close" /></h2>
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
              <PrefixSetter parts={ [
                { name: 'https', editable: false }, 
                { name: '.com', editable: false }, 
                { name: 'facebook', editable: true }, 
                { name: '/group', editable: true }, 
                { name: '/coco', editable: true },
              ] }
              />
              <ul className="actions-container">
                <li><button disabled={ currentStep > 1 || withExistingPrefix } onClick={ () => setCurrentStep(2) } className="btn btn-success">confirm</button></li>
              </ul>
            </div>

            {
              withExistingPrefix &&
              <div className="form-error">
                There is already a webentity with this URL scope in your corpus
              </div>
            }
              
          </div>

          <div className={ cx('step-container', { 'is-disabled': currentStep < 2 }) }>
            <h3 className="step3-title-container">
              <span>Step <span className="step-marker">2/{totalStepsNumber}</span> : choose the webentity homepage <HelpPin place="top">This is the page choosen to display a main URL address for the webentity in lists and visualizations</HelpPin></span>
              <button disabled={ selectedPage === null || currentStep > 2 }  onClick={ () => setCurrentStep(3) } className="btn btn-success">confirm</button>
            </h3>
            <PagesList { ...{ selectedPage, setSelectedPage: onSetSelectedPage } } />
            <li className="standalone-confirm-container">
              <button disabled={ selectedPage === null || currentStep > 2 }  onClick={ () => setCurrentStep(3) } className="btn btn-success">confirm</button>
            </li>
          </div>

          <div className={ cx('step-container', { 'is-disabled': currentStep < 3 }) }>
            <h3>Step <span className="step-marker">3/{totalStepsNumber}</span> : check the webentity name <HelpPin  place="top">This is the name that will be displayed in the lists and visualizations related to the corpus</HelpPin></h3>
            <div className="name-input-container">
              <input className="input" value="facebook" />
              <ul className="actions-container">
                <li><button disabled={ currentStep < 3 }  onClick={ () => setCurrentStep(4) } className="btn btn-success">confirm</button></li>
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
                    <input id="copy-tags" type="checkbox"/><label htmlFor="copy-tags">Copy existing tags</label>
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
            <li><button onClick={ onToggle } className="btn btn-danger">cancel</button></li>
            <li><button disabled={ currentStep !== 4 } className="btn btn-success">include webentity and analyze it !</button></li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}


const EntityModalMockupContainer = ({
  isOpen = true,
  withPreviousTags,
  withExistingPrefix,
  onToggle
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPage, setSelectedPage] = useState(null)


  const onSetSelectedPage = index => {
    setSelectedPage(index)
  }
  return (
    <EntityModal
      {
      ...{
        isOpen,
        onToggle,
        onSetSelectedPage,
        currentStep,
        selectedPage,
        setCurrentStep,
        withPreviousTags,
        withExistingPrefix,
      }
      }
    />
  )
}

export default EntityModalMockupContainer