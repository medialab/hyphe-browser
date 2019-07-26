import './LinkedEntities.styl'

import React, { useState } from 'react'
import cx from 'classnames'

import HelpPin from '../../app/components/HelpPin'
import EntityCard from '../EntityCard'
import EditionCartel from '../EditionCartel'
import CardsList from '../CardsList'
import DownloadListBtn from '../DownloadListBtn'


const STATUSES = ['prospection', 'in', 'out', 'undecided']

let REFERRERS = [
  {
    name: 'gogol',
    homepage: 'https://google.com',
    id: 'google'
  }
]

let REFERRALS = [
  {
    name: 'faceboc',
    homepage: 'https://facebook.com',
    id: 'facebook'
  }
]
for (let i = 0 ; i < 3 ; i++) {
  REFERRERS = REFERRERS.concat(REFERRERS.map(r => ({ ...r, status: STATUSES[parseInt(Math.random() * STATUSES.length)] })))
  REFERRALS = REFERRALS.concat(REFERRALS.map(r => ({ ...r, status: STATUSES[parseInt(Math.random() * STATUSES.length)] })))
}

export const LinkedEntitiesOnly = ({
  setSelected,
  selected,
  resetActions,
  hasPendingActions,
  mergeActions, 
  setMergeActions,
  outActions, 
  setOutActions,
  undecidedActions, 
  setUndecidedActions,
}) => {
  const LINKS = selected === 'referrers' ? REFERRERS : REFERRALS
  
  return (
    <div>
      <div className="linked-entities">
        <nav className="list-toggle">
          {
            // hide parents and children tabs for now
            ['referrers', 'referrals'].map((l, index) => {
              const handleSelectContextualList = () => {
                setSelected(l)
                resetActions()
              }
              return (
                <button
                  className={ cx('btn', 'btn-default', 'navigation', { 'is-selected': l === selected }) }
                  key={ index } 
                  onClick={ handleSelectContextualList }
                >
                  {l === 'referrers' ? 'Citing webentities' : 'Cited webentities'}
                  <HelpPin>
                    {l === 'referrers' ? 
                      'Webentities containing pages which point to this webentity pages'
                      :
                      'Webentities containing pages pointed by this webentity pages'
                    }
                  </HelpPin>
                </button>
              )
            }
            ) }
        </nav>

        <CardsList>
          { LINKS.length ? LINKS.map((link, index) => {

            const toggleKey = (obj, key) => {
              return {
                ...obj,
                ['' + key]: obj['' + key] ? false : true
              }
            }

            const handleClickMerge = () => setMergeActions(toggleKey(mergeActions, index))
            const handleClickOut = () => setOutActions(toggleKey(outActions, index))
            const handleClickUndecided = () => setUndecidedActions(toggleKey(undecidedActions, index))
                          
            return (
              <EntityCard 
                key={ index }
                allowMerge 
                status={ link.status } 
                name={ link.name } 
                url={ link.homepage }
                numberOfCitations={ 12 } 
                onClickMerge={ handleClickMerge }
                onClickOut={ handleClickOut }
                onClickUndecided={ handleClickUndecided }
                isMergeActive={ mergeActions[index] }
                isUndecidedActive={ undecidedActions[index] }
                isOutActive={ outActions[index] }
              />
            )
          }) : 'No links to display' }
        </CardsList>

        {
          hasPendingActions
          &&
          <ul onClick={ resetActions } className="actions-container">
            <li><button className="btn cancel-btn">Discard decisions</button></li>
            <li><button className="btn confirm-btn">Apply 13 decisions on webentities</button></li>
          </ul>
        }
                    
        <div className="download">
          <DownloadListBtn />
        </div>                    
      </div>
    </div>
  )
}


const LinkedEntitiesMockup = function () {
  const [open, setOpen] = useState(true)

  const [selected, setSelected] = useState('referrers')
  const [mergeActions, setMergeActions] = useState({})
  const [outActions, setOutActions] = useState({})
  const [undecidedActions, setUndecidedActions] = useState({})
  const resetActions = () => {
    setMergeActions({})
    setOutActions({})
    setUndecidedActions({})
  }
  const hasPendingActions = [mergeActions, outActions, undecidedActions].find(l => Object.keys(l).find(k => l[k])) !== undefined

  return (
    <div style={ { width: 500, background: 'var(--color-grey-light)', padding: 10 } }>
      <EditionCartel
        isOpen={ open }
        onToggle={ () => setOpen(!open) }
        title={ 'Linked webentities' }
        help={ 'Review webentities citing or cited by the currently browsed webentity' }
      >
        <LinkedEntitiesOnly
          {
          ...{
            setSelected,
            selected,
            resetActions,
            hasPendingActions,

            mergeActions, 
            setMergeActions,
            outActions, 
            setOutActions,
            undecidedActions, 
            setUndecidedActions,
          }
          }
        />
      </EditionCartel>
    </div>
  )
}

export default LinkedEntitiesMockup