export const networkWifiIpRegExp = (value: string) => {
  // eslint-disable-next-line max-len
  const re = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(%[\p{N}\p{L}]+)?$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject('Please enter a valid IP address')
  }
  return Promise.resolve()
}

export const networkWifiPortRegExp = (value: number) => {
  if (value && value <= 0){
    return Promise.reject('This value should be higher than or equal to 1')
  } else if (value && value > 65535) {
    return Promise.reject('This value should be lower than or equal to 65535')
  }
  return Promise.resolve()
}

export const stringContainSpace = (value: string) => {
  const re = new RegExp(/[\s]/)
  if (re.test(value)) {
    return Promise.reject('Spaces are not allowed')
  }
  return Promise.resolve()
}

export const trailingNorLeadingSpaces = (value: string) => {
  if (value && (value.endsWith(' ') || value.startsWith(' '))) {
    return Promise.reject('No leading or trailing spaces allowed')
  }
  return Promise.resolve()
}