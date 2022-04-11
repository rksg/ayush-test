/* eslint-disable no-console */
export const getTenantId = () => {
  /**
   * 'plt-cordova' class is added by Mobile.
   * This will support getting the tenant ID from Local Storage,
   * As mobile the tenant ID in the Mobile is not in the URL
   */
  if (document.documentElement.classList.contains('plt-cordova')) {
    return localStorage.getItem('tenantId')
  }

  let tenantId
  const regExArr = /\?tenant=([0-9a-f]*)/.exec(window.location.search)
  if (regExArr && regExArr.length > 0) {
    tenantId = regExArr[1]
    if (tenantId) {
      return tenantId
    } else {
      console.error('URL is empty')
      return ''
    }
  } else {
    console.error('URL is empty')
    return ''
  }
}
