// Sample usage: jsonrpc('http://hyphe.medialab.sciences-po.fr/dev-forccast-api')('list_corpus')
export default (uri) => (method, params = []) => (
  fetch(uri, {
    method: 'POST',
    body: JSON.stringify({method, params})
  })
  .then((response) => response.json())
  .then(([row]) => {
    if (row.code === 'success') {
      return row.result
    } else if (row.code === 'fail') {
      throw new Error(row.message)
    } else {
      throw new Error('Unrecognized response')
    }
  })
)
