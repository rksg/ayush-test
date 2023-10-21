export const userLogout = () => {
  const token = sessionStorage.getItem('jwt')?? null
  sessionStorage.removeItem('jwt')

  Object.keys(localStorage)
    ?.filter(s => s.includes('SPLITIO'))
    ?.forEach(s => localStorage.removeItem(s))

  window.location.href = token? `/logout?token=${token}` : '/logout'
}