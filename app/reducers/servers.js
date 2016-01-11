import createReducer from '../utils/create-reducer'

const initialState = [
  { name: 'dev', url: 'http://hyphe.medialab.sciences-po.fr/dev-forccast/' },
  { name: 'demo', url: 'http://hyphe.medialab.sciences-po.fr/demo/' }
]

export default createReducer(initialState, {

})
