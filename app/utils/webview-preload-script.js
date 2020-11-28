/* eslint-disable no-var */
// Utilities to be injected into EVERY guest page
// Beware: no Babel here, this code is executed in the webview's guest context
// Note: this is a module and local variables defined here won't pollute guest's global environment
'use strict'

window.addEventListener('DOMContentLoaded', () => {
  const style = {
    background: '#eee',
    borderLeft: '1px solid #ddd',
    borderTopLeftRadius: '5px',
    borderTop: '1px solid #ddd',
    bottom: 0,
    color: '#333',
    fontFamily: 'sans-serif',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: 'normal',
    lineHeight: 1,
    margin: 0,
    padding: '5px',
    position: 'fixed',
    right: 0,
    zIndex: 100000
  }

  const bubble = document.createElement('div')
  Object.assign(bubble.style, style)
  document.body.appendChild(bubble)

  document.body.addEventListener('mouseover', ({ target }) => {
    if (target.tagName === 'A' || target.parentElement && target.parentElement.tagName === 'A') {
      bubble.style.display = 'block'
      bubble.textContent = target.href || target.parentElement && target.parentElement.href
    }
  })
  document.body.addEventListener('mouseout', ({ target }) => {
    if (target.tagName === 'A' || target.parentElement && target.parentElement.tagName === 'A') {
      bubble.style.display = 'none'
    }
  })

  document.querySelectorAll('a').forEach((elem) => {
    elem.setAttribute('target', '_blank')
  })
})
