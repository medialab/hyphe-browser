import React, { useState, useRef } from 'react'
import cx from 'classnames'

import Textarea from 'react-autosize-textarea'

import Button from '../../app/components/Button'
import EditionCartel from '../EditionCartel'


import './ResearchNotes.styl'

const ResearchNotes = function () {
  const [textAreaText, setTextAreaText] = useState('')
  const [notes, setNotes] = useState([])
  const [editedIndex, setEditedIndex] = useState(undefined)
  const input = useRef(null)
  const onAddNote = (e) => {
    if(textAreaText.length) {
      if (editedIndex !== undefined) {
        setNotes(notes.map((n, i) => {
          if (i === editedIndex) {
            return textAreaText
          }
          return n
        }))
        setEditedIndex(undefined)
      } else {
        setNotes([textAreaText, ...notes])
      }
      setTextAreaText('')
    }
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="research-notes-container">
      <form onSubmit={ onAddNote } className="research-note-creation-container">
        <Textarea 
          value={ textAreaText } 
          ref={ input }
          onChange={ e => setTextAreaText(e.target.value) }
          placeholder="You can write some free comments and remarks about the current webentity here"
        />
        <ul className="actions-container">
          <li>
            <button 
              className={ cx({
                'add-button': true,
                'is-disabled': !textAreaText.length
              }) } 
              disabled={ !textAreaText.length }
              type="submit" 
              onClick={ (e) => {onAddNote(e)} }
            >
              {
                editedIndex !== undefined ?
                  'Update note':
                  'Add note'
              }
            </button>
          </li>
          {
            editedIndex !== undefined &&
            <li>
              <button className="cancel-button">
                Cancel changes
              </button>
            </li>
          }
        </ul>
        
      </form>
      {
        notes
          .map((note, index) => {
            const onRemove = () => {
              setNotes(notes.filter((n, i) => i !== index))
            }
            const onEdit = () => {
              setEditedIndex(index)
              setTextAreaText(note)
              input.current.focus()
            }
            if (editedIndex !== undefined && editedIndex === index) {
              return null
            }
            return (
              <div key={ index } className="research-note">
                <div className="research-note-content">{
                  note.split('\n').map((i, key) => <div className="note-block" key={ key }>{i}</div>)
                }</div>
                <Button icon="pencil" onClick={ onEdit } />

                <Button icon="trash" onClick={ onRemove } />
              </div>
            )
          })
      }
    </div>
  )
}

const ResearchNotesMock = function (){
  const [open, setOpen] = useState(true)
  
  return (
    <div style={ { width: 500, background: 'var(--color-grey-light)', padding: 10 } }>
      <EditionCartel
        isOpen={ open }
        onToggle={ () => setOpen(!open) }
        title={ 'Field notes' }
        help={ 'Write free comments and remarks about the currently browsed webentity' }
      >
        <ResearchNotes />
      </EditionCartel>
    </div>
  )
}

export const ResearchNotesDry = ResearchNotes

export default ResearchNotesMock