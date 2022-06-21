/* eslint-disable no-console */
const SEP_CHAR = '$'

export const getTenantId = () => {
  /**
   * 'plt-cordova' class is added by Mobile.
   * This will support getting the tenant ID from Local Storage,
   * As mobile the tenant ID in the Mobile is not in the URL
   */
  if (document.documentElement.classList.contains('plt-cordova')) {
    return localStorage.getItem('tenantId')
  }

  const chunks = window.location.pathname.split('/')
  if (chunks[1] === 't') return chunks[2]
  console.error('URL is empty')
  return ''
}

export const getUserSettingsFromDict = (userSettings: {[key: string]: any}, key: string) => {
  const value = getDeepProp(userSettings, key)
  return value
}

const getDeepProp = (obj: {[key: string]: any}, props:string) => {
  return props.split(SEP_CHAR).reduce((acc, p) => {
    // if the accumulator is something
    // then lookup the next nested property
    // otherwise return null
    if (acc == null) {
      return null
    }
    return acc[p]
  }, obj) // the initial accumulator is the object
}
