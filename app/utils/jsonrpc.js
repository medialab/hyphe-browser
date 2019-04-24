import {
  DEBUG_JSONRPC,
  ERROR_JSONRPC_FETCH,
  ERROR_JSONRPC_PARSE
} from '../constants'

// Sample usage: jsonrpc('http://hyphe.medialab.sciences-po.fr/dev-forccast-api')('list_corpus')
export default (uri) => (method, params = []) => {
  if (DEBUG_JSONRPC) console.debug('JSONRPC →', method, params, uri) // eslint-disable-line no-console

  return fetch(uri, {
    method: 'POST',
    body: JSON.stringify({ method, params })
  })
  .catch(() => { throw new Error(ERROR_JSONRPC_FETCH) })
  .then((response) => {
    const contentType = response.headers.get('content-type')
    if (contentType.includes('application/json')) {
      return response.json()
      .then((json) => {
        if (response.ok) {
          return json
        } else {
          return Promise.reject({
            ...json,
            message: ERROR_JSONRPC_FETCH
          }) 
        }
      })
    }

    else if (contentType.includes('text/html')) {
      return response.text()
      .then((text) => {
        if (response.ok) {
          return text
        } else {
          return Promise.reject({
            err: text,
            status: response.status,
            statusText: response.statusText,
            message: ERROR_JSONRPC_FETCH
          }) 
        }
      })
    }
    throw new Error(ERROR_JSONRPC_PARSE)
  })
  .then((result) => {
    if (result && result.fault) {
      throw result
    }

    const row = result[0]

    if (DEBUG_JSONRPC) {
      let m = row.code === 'fail' ? 'error' : 'debug'
      console[m]('JSONRPC ←', method, row.code, row.result, row.message) // eslint-disable-line no-console
    }

    if (row.code === 'success') {
      return row.result
    } else if (row.code === 'fail') {
      throw new Error(row.message)
    } else {
      throw new Error('Unrecognized response')
    }
  })
  .catch((err) => {
    if (DEBUG_JSONRPC) {
      console.error('JSONRPC ←', method, err) // eslint-disable-line no-console
    }
    throw err
  })
}
