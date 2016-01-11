import createReducer from '../utils/create-reducer'

const initialState = [
  { name: 'dev', url: 'http://hyphe.medialab.sciences-po.fr/dev-forccast-api' },
  { name: 'demo', url: 'http://hyphe.medialab.sciences-po.fr/demo-api' }
]

export default createReducer(initialState, {

})
