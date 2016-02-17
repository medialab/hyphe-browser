export function getSearchUrl (term) {
  return `https://google.fr/search?q=${ encodeURIComponent(term) }`
}
