import { pushPath } from 'redux-simple-router'

export const SELECT_CORPUS = '§_SELECT_CORPUS'

export const selectCorpus = (corpus) => (dispatch) => {
  dispatch({
    type: SELECT_CORPUS,
    payload: {
      corpus
    }
  })

  dispatch(pushPath('/browser'))
}

