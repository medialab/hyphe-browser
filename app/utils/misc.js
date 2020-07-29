export const formatCounter = nb => {
  if (nb < 1000) {
    return nb
  }
  return parseInt(nb/1000) + '.' + ('' + nb/1000%1000).split('.')[1].substr(0, 1) + ' k'
}

export const ellipseStr = (str, limit = 150) => {
  if (str.length > limit) {
    return str.substr(0, limit - 3) + '...'
  }
  return str
}

/**
 * This function uses the Selection API to select the whole text content of a
 * DOM node.
 * @param domNode DOMElement
 */
export function selectNode (domNode) {
  const range = document.createRange()
  range.setStartBefore(domNode)
  range.setEndAfter(domNode)

  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
}
