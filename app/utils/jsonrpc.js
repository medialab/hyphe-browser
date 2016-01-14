import { JSONRPC_DEBUG } from '../constants'

// Sample usage: jsonrpc('http://hyphe.medialab.sciences-po.fr/dev-forccast-api')('list_corpus')
export default (uri) => (method, params = []) => {
  if (JSONRPC_DEBUG) console.debug('JSONRPC →', method, params, uri)

  return fetch(uri, {
    method: 'POST',
    body: JSON.stringify({method, params})
  })
  .then((response) => response.json())
  .then((result) => {
    if (result && result.fault) {
      throw result
    }

    const row = result[0]

    if (JSONRPC_DEBUG) {
      let m = row.code === 'fail' ? 'error' : 'debug'
      console[m]('JSONRPC ←', method, row.code, row.result, row.message)
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
    if (JSONRPC_DEBUG) {
      console.error('JSONRPC ←', method, err)
    }
    throw err
  })
}
