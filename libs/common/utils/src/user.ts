import { get } from '@acx-ui/config'

import { getJwtToken } from './jwtToken'

export const userLogout = () => {
  const token = getJwtToken()
  sessionStorage.removeItem('jwt')
  sessionStorage.removeItem('ACX-ap-compatibiliy-note-hidden') // clear ap compatibiliy banner display condition

  Object.keys(localStorage)
    ?.filter(s => s.includes('SPLITIO'))
    ?.forEach(s => localStorage.removeItem(s))

  if (Boolean(get('IS_MLISA_SA'))) {
    const form = document.createElement('form')
    form.action = get('MLISA_LOGOUT_URL')
    form.method = 'POST'
    document.body.appendChild(form)
    form.submit()
  } else {
    window.location.href = token ? `/logout?token=${token}` : '/logout'
  }
}
