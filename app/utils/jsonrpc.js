import request from 'request'

// Sample usage: jsonrpc('http://hyphe.medialab.sciences-po.fr/dev-forccast-api')('list_corpus')
export default (uri) => (method, params = []) => new Promise((resolve, reject) => {
  request.post(uri, {
    form: JSON.stringify({
      method,
      params
    })
  }, (err, response, body) => {
    if (err) {
      reject(err)
    } else {
      try {
        resolve(JSON.parse(body))
      } catch (e) {
        reject(e)
      }
    }
  })
})
