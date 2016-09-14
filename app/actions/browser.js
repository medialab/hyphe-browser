import { createAction } from 'redux-actions'

export const SHOW_NOTIFICATION = '§_SHOW_NOTIFICATION'
export const HIDE_NOTIFICATION = '§_HIDE_NOTIFICATION'

export const showNotification = ({ id, messageId, messageValues = {}, type = 'notice', timeout = 0 }) => (dispatch) => {
  dispatch({
    type: SHOW_NOTIFICATION,
    payload: { id, messageId, messageValues, type, timeout }
  })

  if (timeout) {
    setTimeout(() => dispatch(hideError()), timeout)
  }
}

export const hideNotification = createAction(HIDE_NOTIFICATION)


// shortcut for back compat

export const showError = ({ id, messageId, messageValues, fatal = false, timeout }) => dispatch =>
  showNotification({ id, messageId, messageValues, type: fatal ? 'error' : 'warning', timeout })(dispatch)

export const hideError = hideNotification
