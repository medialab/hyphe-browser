import isFunction from 'lodash/isFunction'

export default function createReducer (initialState, fnMap, debug) {
  if (debug) {
    console.log('débug', fnMap) //eslint-disable-line no-console
  }
  const debugIsAFunction = isFunction(debug)
  return (state = initialState, { type, payload }) => {
    const handler = fnMap[type]
    if (debugIsAFunction) {
      debug(state, type, payload)
    }
    return handler ? handler(state, payload) : state
  }
}
