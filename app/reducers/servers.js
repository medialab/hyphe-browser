import createReducer from '../utils/create-reducer'
import {
  FETCH_CORPORA_REQUEST,
  CREATE_SERVER_SUCCESS
} from '../actions/servers'

const initialState = {
  list: [
    { name: 'dev', url: 'http://hyphe.medialab.sciences-po.fr/dev-forccast-api' },
    { name: 'demo', url: 'http://hyphe.medialab.sciences-po.fr/demo-api' }
  ],
  selected: null
}

export default createReducer(initialState, {
  // a server has been selected in the startup dropdown
  [FETCH_CORPORA_REQUEST]: (state, { serverUrl }) => ({
    ...state,
    selected: state.list.find(s => s.url === serverUrl)
  }),

  [CREATE_SERVER_SUCCESS]: (state, { server }) => ({
    ...state,
    list: state.list.concat(server)
  })
})
