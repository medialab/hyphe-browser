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
  isOpen = true,
  onToggle
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPage, setSelectedPage] = useState(null)

  const onSetSelectedPage = index => {
    setSelectedPage(index)
    setCurrentStep(4)
  }
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
            
            <h3>Step <span className="step-marker">1/3</span> : check the webentity name <HelpPin  place="top">This is the name that will be displayed in the lists and visualizations related to the corpus</HelpPin></h3>
            <div className="name-input-container">
              <input className="input" value="facebook" />
              <ul className="actions-container">
                <li><button disabled={ currentStep > 1 }  onClick={ () => setCurrentStep(2) } className="btn btn-success">confirm</button></li>
              </ul>
            </div>
          </div>

          <div className={ cx('step-container', { 'is-disabled': currentStep < 2 }) }>
            <h3>Step <span className="step-marker">2/3</span> : define the webentity URL scope <HelpPin place="top">This is the URL address root level from which known pages will be gathered and analyzed by the hyphe server</HelpPin></h3>
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
                <li><button disabled={ currentStep > 2 } onClick={ () => setCurrentStep(3) } className="btn btn-success">confirm</button></li>
              </ul>
            </div>
              
          </div>

          <div className={ cx('step-container', { 'is-disabled': currentStep < 3 }) }>
            <h3>Step <span className="step-marker">3/3</span> : choose the webentity homepage <HelpPin place="top">This is the page choosen to display a main URL address for the webentity in lists and visualizations</HelpPin></h3>
            <PagesList { ...{ selectedPage, setSelectedPage: onSetSelectedPage } } />
          </div>
        </div>
        <div className="modal-footer">
          <ul className="actions-container big">
            <li><button disabled={ currentStep !== 4 } className="btn btn-success">include webentity and analyze it !</button></li>
            <li><button onClick={ onToggle } className="btn btn-danger">cancel</button></li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default EntityModal