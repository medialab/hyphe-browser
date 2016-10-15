import { createAction } from 'redux-actions'

export const SHOW_NOTIFICATION = '§_SHOW_NOTIFICATION'
export const HIDE_NOTIFICATION = '§_HIDE_NOTIFICATION'

export const TOGGLE_DO_NOT_SHOW_AGAIN = '§_TOGGLE_DO_NOT_SHOW_AGAIN'

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

export const toggleDoNotShowAgain = createAction(TOGGLE_DO_NOT_SHOW_AGAIN, (key, hide = null) => ({ key, hide }))


// shortcut for back compat

export const showError = ({ id, messageId, messageValues, fatal = false, timeout }) => dispatch =>
  showNotification({ id, messageId, messageValues, type: fatal ? 'error' : 'warning', timeout })(dispatch)

export const hideError = id => hideNotification(id, 'error')
