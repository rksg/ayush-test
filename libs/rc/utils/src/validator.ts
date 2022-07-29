export function networkWifiIpRegExp (value: string) {
  // eslint-disable-next-line max-len
  const re = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(%[\p{N}\p{L}]+)?$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject('Please enter a valid IP address')
  }
  return Promise.resolve()
}

export function networkWifiPortRegExp (value: number) {
  if (value && value <= 0){
    return Promise.reject('This value should be higher than or equal to 1')
  } else if (value && value > 65535) {
    return Promise.reject('This value should be lower than or equal to 65535')
  }
  return Promise.resolve()
}

export function URLRegExp (value: string) {
  // eslint-disable-next-line max-len
  const re = new RegExp('^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject('Please enter a valid URL')
  }
  return Promise.resolve()
}

export function stringContainSpace (value: string) {
  const re = new RegExp(/[\s]/)
  if (re.test(value)) {
    return Promise.reject('Spaces are not allowed')
  }
  return Promise.resolve()
}

export function checkObjectNotExists (
  list: { [key: string]: string }[],
  value: string,
  entityName: string,
  key = 'name'
) {
  if (list.filter(l => l[key] === value).length !== 0) {
    return Promise.reject(`${entityName} with that ${key} already exists`)
  }
  return Promise.resolve()
}
