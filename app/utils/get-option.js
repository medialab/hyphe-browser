export default (key, def) => {
  let hyphe = localStorage.getItem('hyphe')
  if (!hyphe) return def

  hyphe = JSON.parse(hyphe)
  if (!hyphe.options || !hyphe.options[key]) return def

  return hyphe.options[key]
}
