const urlToLruRegExp = /^([^:\/?#]+):(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/
const authorityRegExp = /^(?:([^:]+)(?::([^@]+))?\@)?(\[[\da-f]*:[\da-f:]*\]|[^\s:]+)(?::(\d+))?$/i
const specialHostsRegExp = /localhost|(\d{1,3}\.){3}\d{1,3}|\[[\da-f]*:[\da-f:]*\]/i

// Convert a LRU (string or object) to fully qualified LRU object
export function parseLru (input) {
  var result = {
    scheme: null,
    host: [],
    port: '',
    path: [],
    query: '',
    fragment: ''
  }

  if (typeof input === 'object') {
    return Object.assign(result, input)
  }

  input.replace(/\|$/, '').split('|').forEach(function (stem){
    var type = stem.substr(0, 1)
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

  // Remove standard port
  if ((result.scheme === 'http' && result.port === '80') || (result.scheme === 'https' && result.port === '443')) {
    result.port = ''
  }

  return result
}

// Convert a URL (string) to LRU object
export function urlToLru (url) {
  const urlMatch = urlToLruRegExp.exec(url)
  if (urlMatch) {
    const [/* trash */, scheme, authority, path, query, fragment] = urlMatch
    const authorityMatch = authorityRegExp.exec(authority)
    if (authorityMatch) {
      const [/* trash */, /* user */, /* password */, matchedHost, port] = authorityMatch
      const host = specialHostsRegExp.test(matchedHost)
        ? [ matchedHost.toLowerCase() ]
        : matchedHost.toLowerCase().split('.')

      return {
        scheme: scheme || 'http',
        host: host.reverse(),
        port: port || '',
        path: (path || '').split('/').filter((s) => !!s),
        query: query || '',
        fragment: fragment || ''
      }
    }
  }

  return null
}

// Convert a LRU (string or object) to a URL (string)
export function lruToUrl (inputLru) {
  const lru = parseLru(inputLru)

  const scheme = (lru.scheme || 'http') + '://'
  const host = lru.host.reduce((s, p) => p + (s ? '.' : '') + s, '')
  const port = lru.port && (':' + lru.port)
  const path = (lru.path.length > 0) ? ('/' + lru.path.join('/')) : ''
  const query = lru.query && ('?' + lru.query)
  const fragment = lru.fragment && ('#' + lru.fragment)

  return scheme + host + port + path + query + fragment
}

// Check if a LRU (string or object) matches a URL (string) or other LRU (string or object)
export function match (lru, url) {
  const lruLru = parseLru(lru)
  const urlLru = urlToLru(url)

  // Now we want to check if LRU matches URL, which means:
  // - url.host starts with lru.host (they're reversed)
  // - url.path starts with lru.path (they're in original order)
  // - query, fragment, scheme, port are the same
  return urlLru.scheme === lruLru.scheme
      && urlLru.host.join('.').startsWith(lruLru.host.join('.'))
      && urlLru.port === lruLru.port
      && urlLru.path.join('.').startsWith(lruLru.path.join('.'))
      && (!lruLru.query || (urlLru.query === lruLru.query))
      && (!lruLru.fragment || (urlLru.fragment === lruLru.fragment))
}

// Returns the longest LRU matching given URL (string) or other LRU (string or object)
// Returns an object { index (number), lru (object), url (string) }
export function longestMatching (lrus, url) {
  return lrus
    // Ensure all LRUs are valid LRU objects
    .map(parseLru)
    // Test for each LRU, and keep track of index to get back to original LRU at end of process
    .map((lru, index) => (match(lru, url) && { lru, index }))
    // Keep only matched values
    .filter((matched) => matched)
    // Convert LRU to strings
    .map(({ lru, index }) => ({ lru, index, url: lruToUrl(lru) }))
    // Then sort by their length, longest first, and grab first one
    .sort((o1, o2) => (o2.url.length - o1.url.length))[0]
}

// Returns the URL (string) with injected '<em>' tags around parts matched by longest LRU (string or object)
export function highlightUrlHTML (lrus, url) {
  const matched = longestMatching(lrus, url)

  if (!matched) {
    return url
  }

  const lruLru = matched.lru
  const urlLru = urlToLru(url)

  // General case: {scheme}://subhost.{host}:{port}/{path}/subpath?{query}#{fragment}
  // All {token}s will be surrounded by a '<em>' tag

  // subhost may be empty, but urlLru.host ≥ lruLru.host
  const subhost = urlLru.host.slice(lruLru.host.length).reverse().join('.')
  // same for path
  const subpath = urlLru.path.slice(lruLru.path.length).join('.')
  const path = (urlLru.path.length > 0)
    ? ((lruLru.path.length > 0)
      ? ('<em>/' + lruLru.path.join('/') + '</em>') + (subpath && ('/' + subpath))
      : ('/' + urlLru.path.join('/')))
    : (urlLru.query || urlLru.fragment) ? '/' : ''

  // We have enough information, as it's a match we don't have to check again
  // if scheme, host, path, query, fragment… are matches
  return '<em>' + urlLru.scheme + '</em>://'
        +(subhost && (subhost + '.'))
        +'<em>' + lruLru.host.slice().reverse().join('.') + '</em>'
        +(urlLru.port && ('<em>:' + urlLru.port + '</em>'))
        +path
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
], 'https://subdomain.www.google.com/toto/tata#fragment')

→ '<em>https</em>://subdomain.<em>com.google.www</em><em>/toto</em>/tata<em>#fragment</em>'
*/
