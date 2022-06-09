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

  const chunks = window.location.pathname.split('/')
  if (chunks[1] === 't') return chunks[2]
  // console.error('URL is empty')
  return ''
}
