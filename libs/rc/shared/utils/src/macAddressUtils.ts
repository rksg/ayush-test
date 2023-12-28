import { includes } from 'lodash'

export const ConvertToStandardMacAddress = (macAddress: string): string => {
  let result = macAddress.toUpperCase()

  if (includes(macAddress, '-')) {
    result = result.replace(/-/g, ':')
  } else if (includes(macAddress, '.') || !includes(macAddress, ':')) {
    result = result.replace(/\./g, '')
    const len = result.length
    const ret = []
    for (let i = 0; i < len; i += 2) {
      ret.push(result.substring(i, i+2))
    }
    result = ret.join(':')
  }

  return result
}

export const IsValidMacAddress = (macAddress: string) => {
  const regex = (includes(macAddress, ':') || includes(macAddress, '-'))
    ? /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/
    : (includes(macAddress, '.'))
      ? /^([0-9A-F]{4}[.]){2}([0-9A-F]{4})$/
      : /^([0-9A-F]{12})$/

  return regex.test(macAddress.toUpperCase())
}