import React, { useState } from 'react'

import EditionCartel from '../EditionCartel'
import { FieldNotesOnly } from '../FieldNotesMock'
import { LinkedWebentities } from '../LinkedEntitiesMock'
import { KnownPages } from '../KnownPagesMock'
import { Tags } from '../TagsMock'
import EntityModal from '../EntityModalMock'

import HelpPin from '../../app/components/HelpPin'

const BrowseLayout = function ({
  status = 'prospection',
}) {
  const [knownPagesOpen, setKnownPagesOpen] = useState(false)
  const [linkedEntitiesOpen, setLinkedEntitiesOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [nameOpen, setNameOpen] = useState(true)
  const [statusOpen, setStatusOpen] = useState(true)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  
  /**
     * Linked entities related
     */
  const [selectedLinkedEntities, setSelectedLinkedEntities] = useState('referrers')
  const [mergeLinkedEntitiesActions, setMergeLinkedEntitiesActions] = useState({})
  const [outLinkedEntitiesActions, setOutLinkedEntitiesActions] = useState({})
  const [undecidedLinkedEntitiesActions, setUndecidedLinkedEntitiesActions] = useState({})
  const resetLinkedEntitiesActions = () => {
    setMergeLinkedEntitiesActions({})
    setOutLinkedEntitiesActions({})
    setUndecidedLinkedEntitiesActions({})
  }
  const hasPendingLinkedEntitiesActions = [mergeLinkedEntitiesActions, outLinkedEntitiesActions, undecidedLinkedEntitiesActions].find(l => Object.keys(l).find(k => l[k])) !== undefined
  /**
     * field notes related
     */
  const [noteTextAreaText, setNoteTextAreaText] = useState('')
  const [notes, setNotes] = useState([])
  const [editedNoteIndex, setEditedNoteIndex] = useState(undefined)
  const onAddNote = (e) => {
    if(noteTextAreaText.length) {
      if (editedNoteIndex !== undefined) {
        setNotes(notes.map((n, i) => {
          if (i === editedNoteIndex) {
            return noteTextAreaText
          }
          return n
        }))
        setEditedNoteIndex(undefined)
      } else {
        setNotes([noteTextAreaText, ...notes])
      }
      setNoteTextAreaText('')
    }
    e.preventDefault()
    e.stopPropagation()
  }
  
  const [categories, setCategories] = useState([])
  const [newCategoryStr, setNewCategoryStr] = useState('')
  
  const onNewCat = e => {
    e.stopPropagation()
    e.preventDefault()
    if (newCategoryStr.length) {
      setCategories([...categories, { category: newCategoryStr, value: '' }])
      setNewCategoryStr('')
    }
  }
    
  return (
    <div className="browse-layout">
      <nav className="browse-nav">
        <button className="hint--right" aria-label="browse previous entity in the prospections list"><i className="ti-angle-left" /></button>
        <span className="current-webentity-name">La maison des feuilles</span>
        <button className="hint--left" aria-label="browse next entity in the prospections list"><i className="ti-angle-right" /></button>
      </nav>
      <div className="browse-edition-container">
          
  
        <EditionCartel
          isOpen={ statusOpen }
          onToggle={ () => setStatusOpen(!statusOpen) }
          title={ 'Webentity status' }
          help={ 'Decide whether the currently browsed webentity should be included in your corpus, excluded, or put aside as "undecided" for further inquiry' }
          helpPlace={ 'right' }
          isAlwaysOpen={ status === 'prospection' }
        >
          <ul className="set-status-container">
            <li className={ status === 'in' ? 'in' : '' } onClick={ () => setModalIsOpen(true) }>IN<HelpPin>include this webentity in the corpus and move it to the IN list</HelpPin></li>
            <li className={ status === 'undecided' ? 'undecided' : '' }>UND.<HelpPin place="bottom">move this webentity to the UNDECIDED list</HelpPin></li>
            <li className={ status === 'out' ? 'out' : '' }>OUT<HelpPin place="left">exclude this webentity and move it to the OUT list</HelpPin></li>
          </ul>
        </EditionCartel>
  
        <EditionCartel
          isOpen={ nameOpen }
          onToggle={ () => setNameOpen(!nameOpen) }
          title={ 'Webentity name' }
          help={ 'Edit the name of the currently browsed webentity. It will be displayed in lists and visualizations' }
          isAlwaysOpen={ status === 'prospection' }
        >
          <input className="input" value="La maison des feuilles" />
        </EditionCartel>
        <EditionCartel
          isOpen={ knownPagesOpen }
          onToggle={ () => setKnownPagesOpen(!knownPagesOpen) }
          title={ 'Known webpages' }
          help={ 'Review known pages belonging to the currently browsed webentity' }
        >
          <KnownPages activeIndex={ 0 } homepageIndex={ 1 } />
        </EditionCartel>
        <EditionCartel
          isOpen={ linkedEntitiesOpen }
          onToggle={ () => setLinkedEntitiesOpen(!linkedEntitiesOpen) }
          title={ 'Linked webentities' }
          help={ 'Review webentities citing or cited by the currently browsed webentity' }
        >
          <LinkedWebentities 
            {
            ...{
              setSelected: setSelectedLinkedEntities,
              selected: selectedLinkedEntities,
              resetActions: resetLinkedEntitiesActions,
              hasPendingActions: hasPendingLinkedEntitiesActions,
      
              mergeActions: mergeLinkedEntitiesActions, 
              setMergeActions: setMergeLinkedEntitiesActions,
              outActions: outLinkedEntitiesActions, 
              setOutActions: setOutLinkedEntitiesActions,
              undecidedActions: undecidedLinkedEntitiesActions, 
              setUndecidedActions: setUndecidedLinkedEntitiesActions,
            }
            }
          />
        </EditionCartel>
        <EditionCartel
          isOpen={ tagsOpen }
          onToggle={ () => setTagsOpen(!tagsOpen) }
          title={ 'Tags' }
          helpPlace={ 'right' }
          help={ 'Annotate the currently browsed webentity with categorized tags (this will be useful to group and visualize webentities)' }
        >
          <Tags 
            {
            ...{
              onNewCat,
              categories,
              setCategories,
              newCategoryStr, 
              setNewCategoryStr,
            }
            }
          />
        </EditionCartel>
        <EditionCartel
          isOpen={ notesOpen }
          onToggle={ () => setNotesOpen(!notesOpen) }
          title={ 'Field notes' }
          help={ 'Write free comments and remarks about the currently browsed webentity' }
          helpPlace="top"
        >
          <FieldNotesOnly 
            {
            ...{
              onAddNote,
              textAreaText: noteTextAreaText, 
              setTextAreaText: setNoteTextAreaText,
              notes, 
              setNotes,
              editedIndex: editedNoteIndex, 
              setEditedIndex: setEditedNoteIndex
            }
            }
          />
        </EditionCartel>
        <EntityModal
          isOpen={ modalIsOpen }
          onToggle={ () => setModalIsOpen(false) }
        />
      </div>    
    </div>
  )
}

export default BrowseLayout