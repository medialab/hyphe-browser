// this reducer's state is persisted in the localStorage

import { DEFAULT_LOCALE } from '../constants'
import createReducer from '../utils/create-reducer'
import {
  SET_LOCALE_SUCCESS
} from '../actions/intl'

const initialState = {
  locale: DEFAULT_LOCALE
}

export default createReducer(initialState, {
  [SET_LOCALE_SUCCESS]: (state, { locale }) => ({
    ...state,
    locale
  })
})
