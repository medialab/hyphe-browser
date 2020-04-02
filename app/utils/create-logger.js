import diff from 'shallow-diff'

export default (op = {}) => p => {
  console.log(diff(op, p), op, p) // eslint-disable-line no-console
  op = p
}
