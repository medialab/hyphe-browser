

export const formatCounter = nb => {
  if (nb < 1000) {
    return nb;
  }
  return parseInt(nb/1000) + '.' + ('' + nb/1000%1000).substr(0, 1) + 'k'
}
