export function getSearchUrl (engine, query) {
  let searchUrl
  switch(engine) {
  case 'google':
  default:
    searchUrl = `https://www.google.com/search?q=${ encodeURIComponent(query) }`
    break
  case 'duckduckgo':
    searchUrl = `https://duckduckgo.com/?q=${ encodeURIComponent(query) }`
    break
  case 'qwant':
    searchUrl = `https://www.qwant.com/?q=${ encodeURIComponent(query) }`
    break
  case 'lilo':
    searchUrl = `https://search.lilo.org/searchweb.php?q=${ encodeURIComponent(query) }`
    break
  case 'yahoo':
    searchUrl = `http://search.yahoo.com/search?p=${ encodeURIComponent(query) }`
    break
  case 'bing':
    searchUrl = `https://www.bing.com/search?q=${ encodeURIComponent(query) }`
    break
  case 'baidu':
    searchUrl = `https://www.baidu.com/s?wd=${ encodeURIComponent(query) }`
    break
  }
  return searchUrl
} 
