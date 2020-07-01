import createReducer from '../utils/create-reducer'
import { FETCH_SERVER_STATUS_REQUEST } from '../actions/corpora'
import {
  CREATE_SERVER,
  UPDATE_SERVER,
  DELETE_SERVER,
  RESET_SERVERS,
  SELECT_SERVER,
  DESELECT_SERVER
} from '../actions/servers'

const initialState = {
  list: [
    {
      id: 'http://hyphe.medialab.sciences-po.fr/demo/api/',
      name: 'Hyphe demo server (limited use)',
      url: 'http://hyphe.medialab.sciences-po.fr/demo/api/',
      home: 'http://hyphe.medialab.sciences-po.fr/demo',
      cloud: null
    }
  ],
  selected: null
}

if (process.env.NODE_ENV === 'development') {
  initialState.list.push({
    id: 'http://hyphe.medialab.sciences-po.fr/dev-forccast-api',
    name: 'dev',
    url: 'http://hyphe.medialab.sciences-po.fr/dev-forccast-api',
    home: 'http://hyphe.medialab.sciences-po.fr/dev-forccast',
    cloud: null
  })
}

export default createReducer(initialState, {
  // a server has been selected in the startup dropdown
  [FETCH_SERVER_STATUS_REQUEST]: (state, { serverUrl }) => ({
    ...state,
    selected: state.list.find(s => s.url === serverUrl)
  }),

  // a newly created server is automatically selected
  [CREATE_SERVER]: (state, { server }) => {
    server.id = server.url
    return {
      ...state,
      list: state.list.concat(server),
      selected: server
    }
  },

  [UPDATE_SERVER]: (state, { server }) => ({
    ...state,
    list: state.list.map(s => {
      return s.id === server.id ? server : s
    }),
    selected: server
  }),

  [DELETE_SERVER]: (state, { server }) => ({
    ...state,
    list: state.list.filter(s => s.id !== server.id),
    selected: null
  }),

  [RESET_SERVERS]: () => ({
    ...initialState
  }),

  [SELECT_SERVER]: (state, { server }) => ({
    ...state,
    selected: state.list.find(s => s.id === server.id) || null
  }),

  [DESELECT_SERVER]: (state) => ({
    ...state,
    selected: null
  })
})
