import './RedirectionModal.styl'
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
  <CardsList displayLoader>
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

const RedirectionModal = ({
  isOpen,
  onSetRedirectionDecision,
  redirectionDecision,
  onSetMergeDecision,
  mergeDecision,
}) => {
  
  return (
    <Modal
      isOpen={ isOpen }
      contentLabel="Redirection modal"
      style={ {
        content: {
          width: 700,
          maxWidth: '90vw',
          position: 'relative',
          top: 0,
          left: 0,
          overflow: 'hidden',
          padding: 0
        }
      } }
    >
      <div className="new-entity-modal-container">
        <div className="modal-header">
          <h2><span>This page requests a redirection</span>
          {/*<i onClick={ onToggle } className="ti-close" />*/}
          </h2>
        </div>
        <div className="modal-body">
          <div className="explanation-text">
              The webpage <code>https://fr.linkedin.com/in/gualfond-nicolas-82052432</code> (belonging to webentity <strong>nicolas gualfond</strong>) wants to redirect the browser to the webpage <code>https://fr.linkedin.com/in/gualfond-nicolas-82052432</code> (belonging to webentity <strong>linkedin</strong>)
          </div>

          <div className={ cx('step-container') }>
            <h3>What should we do regarding the redirection ?</h3>
            <ul className="actions-container big">
              <li><button onClick={ () => {
                onSetRedirectionDecision(false);
                onSetMergeDecision(null)
              } } className={cx('btn', {'btn-success': redirectionDecision === false})}>deny redirection</button></li>
              <li><button onClick={ () => onSetRedirectionDecision(true) }  className={cx('btn', {'btn-success': redirectionDecision === true})}>accept redirection</button></li>
            </ul>
          </div>
          {
            redirectionDecision === true &&
            <div className={ cx('step-container') }>
              <h3>What should we do with the source of the redirection ("https://fr.linkedin.com/in/gualfond-nicolas-82052432" ) ?</h3>
              <ul className="actions-container big">
                <li><button onClick={() => onSetMergeDecision('out')} className={cx('btn', {'btn-success': mergeDecision === 'out'})}>put it into OUT list</button></li>
                <li><button  onClick={() => onSetMergeDecision('merge')} className={cx('btn', {'btn-success': mergeDecision === 'merge'})}>merge it with the redirection destination webentity</button></li>
              </ul>
            </div>
          }
        </div>
        <div className="modal-footer">
          <ul className="actions-container big">
            {/* <li><button className="btn btn-danger">cancel</button></li> */}
            <li><button disabled={ redirectionDecision === null || redirectionDecision && !mergeDecision } className="btn btn-success">validate this decision</button></li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}


const RedirectionModalMockupContainer = ({
  isOpen = true,
}) => {
  const [redirectionDecision, onSetRedirectionDecision] = useState(null)
  const [mergeDecision, onSetMergeDecision] = useState(null)

  return (
    <RedirectionModal
      {
      ...{
        isOpen,
        onSetRedirectionDecision,
        redirectionDecision,
        onSetMergeDecision,
        mergeDecision,
      }
      }
    />
  )
}

export default RedirectionModalMockupContainer