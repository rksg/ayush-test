// Fetch JWT token payload data
export function getJwtTokenPayload (): object {
  if (window.document.cookie.includes('JWT')) {
    const jwtIndex = window.document.cookie.indexOf('JWT')
    const jwt = document.cookie.slice(jwtIndex).split(';')[0]
    const jwtPayload = JSON.parse(atob(jwt.split('.')[1]))
    sessionStorage.setItem('jwtPayload', JSON.stringify(atob(jwt.split('.')[1])))
    return jwtPayload
  } else {
    const error = { error: 'No JWT token found!!' }
    return error
  }
}
