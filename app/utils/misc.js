

export const formatCounter = nb => {
  if (nb < 1000) {
    return nb;
  }
  return parseInt(nb/1000) + '.' + ('' + nb/1000%1000).substr(0, 1) + 'k'
}

export const ellipseStr = (str, limit = 150) => {
  if (str.length > limit) {
    return str.substr(0, limit - 3) + '...';
  }
  return str;
}