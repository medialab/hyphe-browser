import React, { useState, useRef, useEffect } from 'react'
import cx from 'classnames'

import { FormattedMessage as T, useIntl } from 'react-intl'

import Textarea from 'react-autosize-textarea'

import Button from '../Button'

import './FieldNotes.styl'

const FieldNotes = ({
  webentityId,
  initialNotes, 
  onAddNote,
  onUpdateNote,
  onRemoveNote,
}) => {
  const { formatMessage } = useIntl()
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

  const handleKeyAdd = (e) => {
    if (e.keyCode === 13 && e.ctrlKey) handleAddNote(e)
  }

  const handleAddNote = (e) => {
    const newNote = textAreaText.trim()
    if (!validateNote(newNote)) return
    if (newNote.length) {
      setNotes([newNote, ...notes])
      onAddNote(newNote)
    }
    setTextAreaText('')
    e.preventDefault()
    e.stopPropagation()
  }

  const handleCancelChange = (e) => {
    setTextAreaText('')
    setEditedIndex(undefined)
    e.preventDefault()
    e.stopPropagation()
  }

  const validateNote = (value) => {
    const newNote = value.trim()
    if (!newNote.length) return false
    
    const noteFoundIndex = notes.findIndex((note) => newNote === note)
    if (noteFoundIndex !== -1 && editedIndex !== noteFoundIndex) return false
    return true
  }

  return (
    <div className="field-notes-container">
      {
        notes
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

            const handleUpdateNote = () => {
              const newNote = textAreaText.trim()
              if (!validateNote(newNote)) return
              if(newNote.length) {
                setNotes(notes.map((n) => {
                  if (n === note) {
                    return newNote
                  }
                  return n
                }))
                onUpdateNote(note, newNote)
              }
              setEditedIndex(undefined)
              setTextAreaText('')
            }

            const handleKeyUpdate= (e) => {
              if (e.keyCode===13 && e.ctrlKey) handleUpdateNote()
            }

            if (editedIndex !== undefined && editedIndex === index) {
              return (
                <form onSubmit={ handleUpdateNote } className="field-note-creation-container">
                  <Textarea 
                    value={ textAreaText } 
                    ref={ input }
                    onChange={ handleChangeText }
                    onKeyUp={ handleKeyUpdate }
                    placeholder={ formatMessage({ id: 'fieldnotes.placeholder' }) }
                  />
                  <ul className="actions-container">
                    <li>
                      <button className="cancel-button" onClick={ handleCancelChange }>
                        <T id="fieldnotes.cancel-changes" />
                      </button>
                    </li>
                    <li>
                      <button 
                        className={ cx({
                          'add-button': true,
                          'is-disabled': !validateNote(textAreaText)
                        }) } 
                        disabled={ !validateNote(textAreaText) }
                        type="submit" 
                        onClick={ handleUpdateNote }
                      >
                        <T id="fieldnotes.update-note" />
                      </button>
                    </li>         
                  </ul>
                </form>
              )
            }
            return (
              <div key={ index } className="field-note">
                <div className="field-note-content">{
                  note.split('\n').map((i, key) => <div className="note-block" key={ key }>{i}</div>)
                }</div>
                <Button icon="pencil" onClick={ onEdit } className="hint--left" title={ formatMessage({ id: 'fieldnotes.edit-note' }) } />
                <Button icon="trash" onClick={ handleRemoveNote } className="hint--left" title={ formatMessage({ id: 'fieldnotes.delete-note' }) } />
              </div>
            )
          })
      }
      {editedIndex === undefined && <form onSubmit={ handleAddNote } className="field-note-creation-container">
        <Textarea 
          value={ textAreaText } 
          ref={ input }
          onChange={ handleChangeText }
          onKeyUp={ handleKeyAdd }
          placeholder={ formatMessage({ id: 'fieldnotes.placeholder' }) }
        />
        <ul className="actions-container">
          <li>
            <button 
              className={ cx({
                'add-button': true,
                'is-disabled': !validateNote(textAreaText)
              }) } 
              disabled={ !validateNote(textAreaText) }
              type="submit" 
              onClick={ handleAddNote }
            >
              <T id="fieldnotes.add-note" />
            </button>
          </li>         
        </ul>
      </form>
      }   
    </div>
  )
}

export default FieldNotes