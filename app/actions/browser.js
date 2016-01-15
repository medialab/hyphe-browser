import { createAction } from 'redux-actions'

export const SHOW_ERROR = '§_SHOW_ERROR'
export const HIDE_ERROR = '§_HIDE_ERROR'

export const showError = ({ id, message, fatal, icon = 'alert', timeout = 0 }) => (dispatch) => {
  dispatch({
    type: SHOW_ERROR,
    payload: { id, message, fatal, icon, timeout }
  })

  if (timeout) {
    setTimeout(() => dispatch(hideError()), timeout)
  }
}

export const hideError = createAction(HIDE_ERROR)
