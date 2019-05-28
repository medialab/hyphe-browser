import './EntityModal.styl'
import React, {useState} from 'react'
import Modal from 'react-modal'
import cx from 'classnames'

import HelpPin from '../../app/components/HelpPin'
import PrefixSetter from '../PrefixSetter'

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

  const PagesList = () => (
    <ul className="pages-list">
    { PAGES.length ? PAGES.map(link => {
        
      return (
        <li className="page-card" key={ link.id } title={ link.name + '\n' + link.homepage }>
          <div className="link-name">
            <span>{ link.name }</span>
            <span className="link-merge hint--left" aria-label="set as homepage" ><span className="ti-layers-alt" /></span>
          </div>
          <div className="link-url" >{ link.homepage }</div>
        </li>
      )
    }) : 'No links to display' }
  </ul>
  )

const EntityModal = () => {
    const [currentStep, setCurrentStep] = useState(1)
    return (
        <Modal
          isOpen={true}
          contentLabel="New entity modal"
        >
            <div className="new-entity-modal-container">
                <div className="column left-column">
                    <h2>Create a new webentity</h2>
                    <div>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer varius faucibus enim at iaculis. Pellentesque semper lobortis mollis. Vestibulum pretium tortor at porta tristique. Etiam mattis ante quis vestibulum dictum. Proin in lectus et neque fringilla facilisis. Donec ut dignissim mauris. Nunc quam lacus, pellentesque pharetra libero sed, tempus porttitor eros. Aenean ullamcorper sapien a purus consectetur gravida. Nunc ut mauris dui. Etiam vitae libero augue. Suspendisse imperdiet porttitor aliquam. Ut eu leo venenatis, sodales nulla sed, maximus augue. Vestibulum et justo enim.
                    </div>
                </div>
                <div className="column right-column">
                    <div className="column-body">
                        <div className={cx('step-container')}>
                            <h3>Step 1/3 : define webentity name <HelpPin>Help about step 1</HelpPin></h3>
                            <input className="input" value="facebook" />
                            <ul className="actions-container">
                                <li><button disabled={currentStep > 1}  onClick={() => setCurrentStep(2)} className="btn btn-success">validate</button></li>
                            </ul>
                        </div>

                        <div className={cx('step-container', {'is-disabled': currentStep < 2})}>
                            <h3>Step 2/3 : define webentity URL scope <HelpPin>Help about step 2</HelpPin></h3>
                            <div style={{position: 'relative'}}>
                            <PrefixSetter parts={[
                            { name: 'https', editable: false }, 
                            { name: '.com', editable: false }, 
                            { name: 'facebook', editable: true }, 
                            { name: '/group', editable: true }, 
                            { name: '/coco', editable: true },
                            ]} />
                            </div>
                            <ul className="actions-container">
                                <li><button disabled={currentStep > 2} onClick={() => setCurrentStep(3)} className="btn btn-success">validate</button></li>
                            </ul>
                        </div>

                        <div className={cx('step-container', {'is-disabled': currentStep < 3})}>
                            <h3>Step 3/3 : choose webentity homepage <HelpPin>Help about step 3</HelpPin></h3>
                            <PagesList />
                            <ul className="actions-container">
                                <li><button disabled={currentStep > 3} onClick={() => setCurrentStep(4)} className="btn btn-success">validate</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="column-footer">
                        <ul className="actions-container big">
                            <li><button disabled={currentStep !== 4} className="btn btn-success">create webentity and crawl</button></li>
                            <li><button className="btn btn-danger">cancel</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default EntityModal