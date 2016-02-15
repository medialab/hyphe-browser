import createReducer from '../utils/create-reducer'
import { FETCH_CORPORA_REQUEST } from '../actions/corpora'
import {
  CREATE_SERVER,
  UPDATE_SERVER,
  DELETE_SERVER,
  RESET_SERVERS
} from '../actions/servers'

const initialState = {
  list: [
    {
      id: 'http://hyphe.medialab.sciences-po.fr/dev-forccast-api',
      name: 'dev',
      url: 'http://hyphe.medialab.sciences-po.fr/dev-forccast-api'
    },
    {
      id: 'http://hyphe.medialab.sciences-po.fr/demo-api',
      name: 'Serveur de démonstration - limité',
      url: 'http://hyphe.medialab.sciences-po.fr/demo-api'
    }
  ],
  selected: null
}

export default createReducer(initialState, {
  // a server has been selected in the startup dropdown
  [FETCH_CORPORA_REQUEST]: (state, { serverUrl }) => ({
    ...state,
    selected: state.list.find(s => s.url === serverUrl)
  }),

  [CREATE_SERVER]: (state, { server }) => {
    server.id = server.url
    return {
      ...state,
      list: state.list.concat(server)
    }
  },

  [UPDATE_SERVER]: (state, { server }) => ({
    ...state,
    list: state.list.map(s => s.id === server.id ? server : s),
    selected: server
  }),

  [DELETE_SERVER]: (state, { server }) => ({
    ...state,
    list: state.list.filter(s => s.id !== server.id),
    selected: null
  }),

  [RESET_SERVERS]: () => ({
    ...initialState
  })
})
