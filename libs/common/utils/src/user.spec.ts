import { userLogout } from './user'

describe('userLogout', () => {
  const { location } = window
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: { href: new URL('https://url/').href }
    })
  })
  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true, enumerable: true, value: location
    })
  })

  it('should logout correctly', () => {
    userLogout()
    expect(window.location.href).toEqual('/logout')
  })

  it('should logout with token', () => {
    sessionStorage.setItem('jwt', 'testToken')
    const token = sessionStorage.getItem('jwt')

    userLogout()
    expect(window.location.href).toEqual(`/logout?token=${token}`)
  })
})
