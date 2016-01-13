export const SHOW_ERROR = '§_SHOW_ERROR'
export const HIDE_ERROR = '§_HIDE_ERROR'

export const showError = ({ message, fatal, icon = 'alert', timeout = 0 }) => (dispatch) => {
  dispatch({
    type: SHOW_ERROR,
    payload: { message, fatal, icon, timeout }
  })

  if (timeout) {
    setTimeout(() => dispatch(hideError()), timeout)
  }
}

export const hideError = () => ({
  type: HIDE_ERROR,
  payload: {}
})
