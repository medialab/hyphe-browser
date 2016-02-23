import * as allTranslations from '../translations'

export const SET_LOCALE_SUCCESS = '§_SET_LOCALE_SUCCESS'
export const SET_LOCALE_ERROR = '§_SET_LOCALE_ERROR'

export const setLocale = (locale) => (dispatch) => {
  const shortLocale = locale.substring(0, 2)
  const messages = allTranslations[shortLocale]
  if (!messages) {
    dispatch({
      type: SET_LOCALE_ERROR,
      payload: {
        message: 'No translations found'
      }
    })
  } else {
    dispatch({
      type: SET_LOCALE_SUCCESS,
      payload: {
        locale,
        messages
      }
    })
  }
}
