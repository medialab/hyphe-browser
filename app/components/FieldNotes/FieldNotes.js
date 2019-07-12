import React, { useState, useRef, useEffect } from 'react'
import cx from 'classnames'

import Textarea from 'react-autosize-textarea'

import Button from '../Button'

import './FieldNotes.styl'

const FieldNotes = ({
  webentityId,
  initialNotes, 
  onAddNote,
  onRemoveNote,
}) => {
  const [textAreaText, setTextAreaText] = useState('')
  const [notes, setNotes] = useState(initialNotes)
  const [editedIndex, setEditedIndex] = useState(undefined)

  const input = useRef(null)

  useEffect(() => {
    setNotes(initialNotes)
  }, [webentityId])
  
  const handleChangeText = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setTextAreaText(e.target.value) 
  }

  const handleAddNote = (e) => {
    if(textAreaText.length) {
      if (editedIndex !== undefined) {
        const prevNote = notes.find((note, index) => index === editedIndex)
        onRemoveNote(prevNote)
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
      onAddNote(textAreaText)
      setTextAreaText('')
    }
    e.preventDefault()
    e.stopPropagation()
  }
  return (
    <div className="field-notes-container">
      {
        notes
          .reverse()
          .map((note, index) => {
            
            const handleRemoveNote = () => {
              setNotes(notes.filter((n) => n !== note ))
              onRemoveNote(note)
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

                <Button icon="trash" onClick={ handleRemoveNote } className="hint--left" title="delete note" />
              </div>
            )
          })
      }
      <form onSubmit={ handleAddNote } className="field-note-creation-container">
        <Textarea 
          value={ textAreaText } 
          ref={ input }
          onChange={ handleChangeText }
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
              onClick={ (e) => {handleAddNote(e)} }
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

export default FieldNotes