import { createAction } from 'redux-actions'

export const SHOW_NOTIFICATION = '§_SHOW_NOTIFICATION'
export const HIDE_NOTIFICATION = '§_HIDE_NOTIFICATION'

export const SELECT_CONTEXTUAL_LIST = '§_SELECT_CONTEXTUAL_LIST'

export const TOGGLE_DO_NOT_SHOW_AGAIN = '§_TOGGLE_DO_NOT_SHOW_AGAIN'

export const TOGGLE_CONTEXT = '§_TOGGLE_CONTEXT'
export const TOGGLE_CATEGORIES = '§_TOGGLE_CATEGORIES'
export const TOGGLE_FREETAGS = '§_TOGGLE_FREETAGS'

export const showNotification = ({ id, messageId, messageValues = {}, type = 'notice', timeout = 0 }) => (dispatch) => {
  dispatch({
    type: SHOW_NOTIFICATION,
    payload: { id, messageId, messageValues, type, timeout }
  })

  if (timeout) {
    setTimeout(() => dispatch(hideNotification(id)), timeout)
  }
}

export const hideNotification = createAction(HIDE_NOTIFICATION, (id, type) => ({ id, type }))

export const selectContextualList = (selectedContext) => ({ type: SELECT_CONTEXTUAL_LIST, payload: { selectedContext } })

export const toggleDoNotShowAgain = createAction(TOGGLE_DO_NOT_SHOW_AGAIN, (key, hide = null) => ({ key, hide }))

export const toggleContext = createAction(TOGGLE_CONTEXT)

export const toggleCategories = createAction(TOGGLE_CATEGORIES)

export const toggleFreetags = createAction(TOGGLE_FREETAGS)

// shortcut for back compat

export const showError = ({ id, messageId, messageValues, fatal = false, timeout }) => dispatch =>
  showNotification({ id, messageId, messageValues, type: fatal ? 'error' : 'warning', timeout })(dispatch)

export const hideError = id => hideNotification(id, 'error')

export const hideNotif = () => hideNotification()
