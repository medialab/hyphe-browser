import React, { useState } from 'react'
import cx from 'classnames'

import Textarea from 'react-autosize-textarea'

import HelpPin from '../../app/components/HelpPin'
import Button from '../../app/components/Button'

import './ResearchNotes.styl'

const ResearchNotes = function () {
  const [textAreaText, setTextAreaText] = useState('')
  const [notes, setNotes] = useState([])
  const onAddNote = (e) => {
    if(textAreaText.length) {
      setNotes([textAreaText, ...notes])
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
          onChange={ e => setTextAreaText(e.target.value) }
          placeholder="Write some comments about the current webentity"
        />
        <button 
          className={ cx({
            'add-button': true,
            'is-disabled': !textAreaText.length
          }) } 
          disabled={ !textAreaText.length }
          type="submit" 
          onClick={ (e) => {onAddNote(e)} } 
        >
                Add note
        </button>
      </form>
      {
        notes.length ?
          <h5>Existing notes</h5>
          : null
      } 
      {
        notes.map((note, index) => {
          const onRemove = () => {
            setNotes(notes.filter((n, i) => i !== index))
          }
          return (
            <div key={ index } className="research-note">
              <div className="research-note-content">{
                note.split('\n').map((i, key) => <div key={ key }>{i}</div>)
              }</div>
              <Button icon="close" onClick={ onRemove }>x</Button>
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
    <div className="browser-side-bar">
      <div className="browser-side-bar-sections">
  
        <div className="browser-side-bar-tags browser-research-notes">
          <div>
            <h3
              onClick={ () => setOpen(!open) }
            >
              <span 
                className={ cx({
                  'ti-angle-up': open,
                  'ti-angle-down': !open
                }) }
              />
              <span>Notes <HelpPin>about notes</HelpPin></span>
                
            </h3>
  
            {
              open &&
              <ResearchNotes />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export const ResearchNotesDry = ResearchNotes

export default ResearchNotesMock