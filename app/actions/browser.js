export const SHOW_ERROR = '§_SHOW_ERROR'
export const HIDE_ERROR = '§_HIDE_ERROR'

export const showError = ({ message, fatal, icon = 'alert' }) => ({
  type: SHOW_ERROR,
  payload: { message, fatal, icon }
})

export const hideError = () => ({
  type: HIDE_ERROR,
  payload: {}
})
