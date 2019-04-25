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
    if (response.ok) return response.json()
    else if (response.status && response.statusText) {
      const { status, statusText } = response
      throw new Error(`${status} (${statusText})`)
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
