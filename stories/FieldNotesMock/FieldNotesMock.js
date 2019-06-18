import React, { useState, useRef } from 'react'
import cx from 'classnames'

import Textarea from 'react-autosize-textarea'

import Button from '../../app/components/Button'
import EditionCartel from '../EditionCartel'


import './FieldNotes.styl'

const FieldNotes = ({
  editedIndex, 
  notes, 
  onAddNote,
  setNotes,
  setEditedIndex,
  setTextAreaText,
  textAreaText, 
}) => {
  const input = useRef(null)
  return (
    <div className="field-notes-container">
      {
        notes
          .reverse()
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
              <div key={ index } className="field-note">
                <div className="field-note-content">{
                  note.split('\n').map((i, key) => <div className="note-block" key={ key }>{i}</div>)
                }</div>
                <Button icon="pencil" onClick={ onEdit } className="hint--left" title="edit note" />

                <Button icon="trash" onClick={ onRemove } className="hint--left" title="delete note" />
              </div>
            )
          })
      }
      <form onSubmit={ onAddNote } className="field-note-creation-container">
        <Textarea 
          value={ textAreaText } 
          ref={ input }
          onChange={ e => setTextAreaText(e.target.value) }
          placeholder="You can write some free comments and remarks about the current webentity here"
        />
        <ul className="actions-container">
          {
            editedIndex !== undefined &&
            <li>
              <button className="cancel-button">
                Cancel changes
              </button>
            </li>
          }
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
          
        </ul>
        
      </form>
      
    </div>
  )
}

const FieldNotesMockupContainer = function (){
  const [open, setOpen] = useState(true)

  const [textAreaText, setTextAreaText] = useState('')
  const [notes, setNotes] = useState([])
  const [editedIndex, setEditedIndex] = useState(undefined)
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
    <div style={ { width: 500, background: 'var(--color-grey-light)', padding: 10 } }>
      <EditionCartel
        isOpen={ open }
        onToggle={ () => setOpen(!open) }
        title={ 'Field notes' }
        help={ 'Write free comments and remarks about the currently browsed webentity' }
      >
        <FieldNotes 
          {
          ...{
            onAddNote,
            textAreaText, 
            setTextAreaText,
            notes, 
            setNotes,
            editedIndex, 
            setEditedIndex
          }
          }
        />
      </EditionCartel>
    </div>
  )
}

export const FieldNotesDry = FieldNotes

export default FieldNotesMockupContainer