import { DEFAULT_LOCALE } from '../constants'
import createReducer from '../utils/create-reducer'
import {
  SET_LOCALE_SUCCESS,
  SET_LOCALE_ERROR
} from '../actions/intl'

const initialState = {
  locale: DEFAULT_LOCALE,
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
