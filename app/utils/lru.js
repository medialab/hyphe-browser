/* eslint no-useless-escape: 0 */

const urlToLruRegExp = /^([^:\/?#]+):(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/
const authorityRegExp = /^(?:([^:]+)(?::([^@]+))?\@)?(\[[\da-f]*:[\da-f:]*\]|[^\s:]+)(?::(\d+))?$/i
const specialHostsRegExp = /localhost|(\d{1,3}\.){3}\d{1,3}|\[[\da-f]*:[\da-f:]*\]/i

import tail from 'lodash/fp/tail'
import isEqual from 'lodash/fp/isEqual'
import last from 'lodash/fp/last'
import dropRightWhile from 'lodash/fp/dropRightWhile'
import initial from 'lodash/fp/initial'

const isEmptySpace = isEqual('')

// Convert a LRU (string or object) to fully qualified LRU object
// full host: right to left (i.e: [com, faceboook, fr-fr, wwww])
export function parseLru (input, tldTree) {
  const result = {
    scheme: null,
    host: [],
    tld: '',
    port: '',
    path: [],
    query: '',
    fragment: ''
  }

  if (typeof input === 'object') {
    return Object.assign(result, input)
  }

  input.replace(/\|$/, '').split('|').forEach(function (stem){
    const type = stem.substr(0, 1)
    const name = stem.substr(2, stem.length - 2)
    if (type=='s') {
      result.scheme = name.toLowerCase()
    } else if (type=='t') {
      result.port = name
    } else if (type=='h') {
      result.host.push(name.toLowerCase())
    } else if (type=='p') {
      result.path.push(name)
    } else if (type=='q') {
      result.query = decodeURIComponent(name)
    } else if (type=='f') {
      result.fragment = decodeURIComponent(name)
    }
  })

  // Split full host info into TLD + host
  const [ rhost, tld ] = _lruHostInfo(result.host.slice().reverse().join('.'), tldTree)
  if (tld) {
    result.tld = tld
    result.host = rhost.splice('.').reverse()
  }

  // Remove standard port
  if ((result.scheme === 'http' && result.port === '80') || (result.scheme === 'https' && result.port === '443')) {
    result.port = ''
  }

  return result
}

// hostArray: natural order (i.e. [fr-fr, facebook, com])
function _getTLD (hostArray, tldTree, rindex = 0, tld = '') {
  if (rindex >= hostArray.length) {
    return tld
  }

  const chunk = hostArray[hostArray.length - 1 - rindex]
  const subTree = tldTree[chunk]

  // Stop-chunk
  if (tldTree['!' + chunk]) {
    return tld
  }

  // Should continue appending tld part?
  if (tldTree['*'] || subTree) {
    tld = tld ? (chunk + '.' + tld) : chunk
  }

  // Keep traversing if found deeper parts
  return subTree ? _getTLD(hostArray, subTree, rindex + 1, tld) : tld
}

// host: natural order, string, i.e: 'fr-fr.facebook.com'
function _lruHostInfo (host, tldTree) {
  const parts = host.toLowerCase().split('.')
  if (tldTree) {
    const tld = _getTLD(parts, tldTree)
    if (tld) {
      const nbTldParts = tld.split('.').length
      return [ parts.slice(0, parts.length - nbTldParts), tld ]
    }
  }
  // No TLD found
  return [ parts, '' ]
}

// Convert a URL (string) to LRU object
// output host: reverse order (i.e: [facebook, fr-fr])
export function urlToLru (url, tldTree) {
  const urlMatch = urlToLruRegExp.exec(url)
  if (urlMatch) {
    const [/* trash */, scheme, authority, path, query, fragment] = urlMatch
    const authorityMatch = authorityRegExp.exec(authority)
    if (authorityMatch) {
      const [/* trash */, /* user */, /* password */, matchedHost, port] = authorityMatch
      const [ host, tld ] = specialHostsRegExp.test(matchedHost)
        ? [ [ matchedHost.toLowerCase() ], '' ]
        : _lruHostInfo(matchedHost, tldTree)
      let pathArray = []
      if (path !== '/') {
        pathArray = (path || '').split('/')
        if (pathArray[0] === '' && pathArray.length >= 2) {
          pathArray = tail(pathArray)
        }
      }
      return {
        scheme: scheme || 'http',
        host: host.slice().reverse(), // Clone here to not reverse original object and mess up with logging
        tld: tld || '',
        port: port || '',
        path: pathArray,
        query: query || '',
        fragment: fragment || ''
      }
    }
  }

  return null
}

// Convert a LRU (string or object) to a URL (string)
export function lruToUrl (inputLru, tldTree) {
  const lru = parseLru(inputLru, tldTree)

  const scheme = (lru.scheme || 'http') + '://'
  const tld = lru.tld ? '.' + lru.tld : ''
  const host = lru.host.reduce((s, p) => p + (s ? '.' : '') + s, '')
  const port = lru.port && (':' + lru.port)
  const path = (lru.path.length > 0) ? ('/' + lru.path.join('/')) : ''
  const query = lru.query && ('?' + lru.query)
  const fragment = lru.fragment && ('#' + lru.fragment)

  return scheme + host + tld + port + path + query + fragment
}

function httpsVariations (lru) {
  if (lru.includes('s:http|')) {
    return lru.replace('s:http|', 's:https|')
  }
  if (lru.includes('s:https|')) {
    return lru.replace('s:https|', 's:http|')
  }
}

export function lruVariations (lru) {
  lru = lruObjectToString(lru)
  if (isEmptySpace(lru.trim())) {
    return ['']
  }
  let variations = [lru]
  const httpVariations = httpsVariations(lru)
  if (httpVariations) {
    variations = [...variations, httpVariations]
  }
  const hosts = lru.split('|').filter(stem => stem.startsWith('h:'))
  const hostsStr = `${hosts.join('|')}|`
  if (hosts.length === 1) {
    return variations
  }
  if (hosts[hosts.length - 1] === 'h:www') {
    hosts.pop()
  } else {
    hosts.push('h:www')
  }
  const wwwHostsStr = `${hosts.join('|')}|`
  variations.push(
    lru.replace(hostsStr, wwwHostsStr)
  )
  if (httpVariations) {
    variations.push(
      httpVariations.replace(hostsStr, wwwHostsStr)
    )
  }
  return variations
}

// Check if a LRU (string or object) matches a URL (string) or other LRU (string or object)
export function match (lru, url, tldTree) {
  const urlLru = lruObjectToString(urlToLru(url, tldTree))
  return urlLru.startsWith(lruObjectToString(lru))
  // return urlLru.startsWith(lruLru)
}

// Returns the longest LRU matching given URL (string) or other LRU (string or object)
// Returns an object { index (number), lru (object), url (string) }
export function longestMatching (lrus, url, tldTree) {
  return lrus
    // Ensure all LRUs are valid LRU objects
    .map(lru => parseLru(lru, tldTree))
    // Test for each LRU, and keep track of index to get back to original LRU at end of process
    .map((lru, index) => (match(lru, url, tldTree) && { lru, index }))
    // Keep only matched values
    .filter((matched) => matched)
    // Convert LRU to strings
    .map(({ lru, index }) => ({ lru, index, url: lruToUrl(lru) }))
    // Then sort by their length, longest first, and grab first one
    .sort((o1, o2) => (o2.url.length - o1.url.length))[0]
}

export function hasExactMatching (lrus, url, tldTree) {
  const cleanUrl = lruToUrl(urlToLru(url, tldTree), tldTree)
  // Matches exactly if final URL is the same
  return lrus.some(lru => lruToUrl(parseLru(lru, tldTree), tldTree) === cleanUrl)
}

// Returns the URL (string) with injected '<em>' tags around parts matched by longest LRU (string or object)
export function highlightUrlHTML (lrus, url, tldTree) {
  const urlLru = urlToLru(url, tldTree)
  if (!urlLru) {
    return url
  }

  const matched = longestMatching(lrus, url, tldTree)
  if (!matched) {
    return url
  }

  const lruLru = matched.lru

  // General case: {scheme}://subhost.{host}:{port}/{path}/subpath?{query}#{fragment}
  // All {token}s will be surrounded by a '<em>' tag

  // subhost may be empty, but urlLru.host ≥ lruLru.host
  const subhost = urlLru.host.slice(lruLru.host.length).reverse().join('.')
  // same for path
  const subpath = urlLru.path.slice(lruLru.path.length).join('/')

  let path
  if (urlLru.path.length > 0) {
    if (lruLru.path.length > 0) {
      path = ('<em>/' + lruLru.path.join('/') + '</em>')
      if (subpath || isEmptySpace(last(urlLru.path))) {
        path += '/' + subpath
      }
    } else {
      path = '/' + urlLru.path.join('/')
    }
  } else if (urlLru.query || urlLru.fragment) {
    path = '/'
  } else {
    path = ''
  }
  const trailingSlashes = url.split(lruToUrl(urlLru))[1]
  // We have enough information, as it's a match we don't have to check again
  // if scheme, host, path, query, fragment… are matches
  return '<em>' + urlLru.scheme + '</em>://'
        +(subhost && (subhost + '.'))
        +'<em>' + lruLru.host.slice().reverse().join('.') + '</em>'
        +(urlLru.tld && ('<em>.' + urlLru.tld + '</em>'))
        +(urlLru.port && ('<em>:' + urlLru.port + '</em>'))
        +path
        +(trailingSlashes ? trailingSlashes : '')
        +(lruLru.query ? ('<em>?' + lruLru.query + '</em>') : (urlLru.query && ('?' + urlLru.query)))
        +(lruLru.fragment ? ('<em>#' + lruLru.fragment + '</em>') : (urlLru.fragment && ('#' + urlLru.fragment)))
}

/* Example:

highlightUrlHTML([
  's:https|h:com|h:google|',
  's:https|h:com|h:google|',
  's:http|h:com|h:google|h:www',
  's:http|h:com|h:google|h:www',
  's:https|h:com|h:google|h:www|p:toto',
  's:https|h:com|h:google|h:www|p:toto|f:fragment',
  's:https|h:com|h:google|h:www|f:fragment',
  's:https|h:com|h:google|h:www',
  's:https|h:com|h:google|h:www'
], 'https://subdomain.www.google.com/toto/tata#fragment', tldTree)

→ '<em>https</em>://subdomain.<em>com.google.www</em><em>/toto</em>/tata<em>#fragment</em>'
*/

export function urlToName (url, tldTree) {
  const lruObj = urlToLru(url.replace(/\/$/, ''), tldTree)
  return lruObjectToName(lruObj)
}

export function lruToName (lru, tldTree) {
  const lruObj = parseLru(lru.replace(/\|p:\|$/, '|'), tldTree)
  return lruObjectToName(lruObj)
}

export function lruObjectToName (lru) {
  if (!lru)
    return '<Impossible to Name> ' + url

  let name = lru.host
    .map((d, i) => {
      if (i === 0 && lru.tld)
        return toDomainCase(d)
      return d.replace(/\[]/g, '')
    })
    .reverse()
    .filter((d, i) => d !== 'www' || i > 0)
    .join('.')

  if (lru.tld)
    name += "." + lru.tld

  if (lru.port && lru.port !== '80')
    name += ' :' + lru.port

  if (lru.path.length === 1 && lru.path[0].trim().length > 0)
    name += ' /' + decodeURIComponent(lru.path[0])
  else if (lru.path.length > 1)
    name += ' /…/' + decodeURIComponent(lru.path[lru.path.length - 1])

  if (lru.query && lru.query.length > 0)
    name += ' ?' + decodeURIComponent(lru.query)

  if (lru.fragment && lru.fragment.length > 0)
    name += ' #' + decodeURIComponent(lru.fragment)

  return name
}

function toDomainCase (s) {
  return s.replace(/\w[^ -]*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

export function isValidUrl (string) {
  try {
    new URL(string)
  } catch (_) {
    return false
  }
  return true
}

export function simplierUrl (url) {
  return url.replace(/#[^#]*$/, '').replace(/\/$/, '').replace(/^(?:https?:\/\/)?/i,'')
}

export function compareUrls (url1, url2) {
  if (!url1 || !url2) return false
  return simplierUrl(url1) === simplierUrl(url2)
}

export function lruObjectToString (input) {
  if (typeof input === 'string') {
    return input
  }

  let lru = 's:' + input.scheme + '|'

  if(input.port && input.port !== '80') {
    lru += 't:' + input.port + '|'
  }
  if(input.tld) {
    lru += 'h:' + input.tld + '|'
  }
  input.host.forEach((h) => lru += 'h:' + h + '|')
  input['path'].forEach((p) => lru += 'p:' + p + '|')
  if(input.query) {
    lru += 'q:' + input.query + '|'
  }
  if(input.fragment) {
    lru += 'f:' + input.fragment + '|'
  }
  return lru
}

export const parsePrefixes = (lru, url, newEntity, tldTree) => {
  const urlLru = lruObjectToString(urlToLru(url, tldTree))
  const l = lru.split('|').length
  return dropRightWhile((stem) => stem === 'p:', initial(urlLru.split('|'))).map((stem, index) => {
    const editable = newEntity ? index >= l : index >= l - 1
    return {
      name: stem,
      editable,
      selected: index < l - 1 || newEntity,
    }
  })
}
