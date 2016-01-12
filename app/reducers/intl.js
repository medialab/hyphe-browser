import createReducer from '../utils/create-reducer'
import {
  SET_LOCALE_SUCCESS,
  SET_LOCALE_ERROR
} from '../actions/intl'

const initialState = {
  locale: 'fr-FR',
  messages: {}
}

export default createReducer(initialState, {
  // display loader
  [SET_LOCALE_SUCCESS]: (state, { locale, messages }) => ({
    ...state,
    locale,
    messages
  }),
  [SET_LOCALE_ERROR]: (state) => (state) // TODO
})
