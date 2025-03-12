import { get } from '@acx-ui/config'

import { getJwtToken } from './jwtToken'

export const userLogout = () => {
  const token = getJwtToken()
  sessionStorage.removeItem('jwt')
  sessionStorage.removeItem('ACX-ap-compatibiliy-note-hidden') // clear ap compatibiliy banner display condition

  Object.keys(localStorage)
    ?.filter(s => s.includes('SPLITIO') || s.includes('pagesize'))
    ?.forEach(s => localStorage.removeItem(s))

  Object.keys(sessionStorage)
    ?.filter(s => s.includes('pagesize') || s.includes('-filter'))
    ?.forEach(s => sessionStorage.removeItem(s))

  if (Boolean(get('IS_MLISA_SA'))) {
    const search = new URLSearchParams(window.location.search)
    if (token) { search.append('token', token) }
    const queryParams = decodeURIComponent(search.toString())
    const form = document.createElement('form')
    form.action = get('MLISA_LOGOUT_URL')
    if (queryParams) { form.action += `?${queryParams}` }
    form.method = 'POST'
    document.body.appendChild(form)
    form.submit()
  } else {
    window.location.href = token ? `/logout?token=${token}` : '/logout'
  }
}
