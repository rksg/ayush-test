export const userLogout = () => {
  const token = sessionStorage.getItem('jwt')?? null
  sessionStorage.removeItem('jwt')
  sessionStorage.removeItem('ACX-ap-compatibiliy-note-hidden') // clear ap compatibiliy banner display condition

  Object.keys(localStorage)
    ?.filter(s => s.includes('SPLITIO'))
    ?.forEach(s => localStorage.removeItem(s))

  window.location.href = token? `/logout?token=${token}` : '/logout'
}