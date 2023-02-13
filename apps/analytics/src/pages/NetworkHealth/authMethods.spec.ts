import {
  authMethodsByClientType,
  authMethodsByCode
} from './authMethods'
import {
  AuthenticationMethod,
  ClientType
} from './types'


describe('authMethodsByClientType', () => {
  it('matches snapshot', () => {
    Object.values(ClientType).forEach(type => {
      const result = authMethodsByClientType[type]
      expect(result).toMatchSnapshot()
    })
  })
})

describe('authMethodsByCode', () => {
  it('matches snapshot', () => {
    Object.values(AuthenticationMethod).forEach(method => {
      const result = authMethodsByCode[method]
      expect(result).toMatchSnapshot()
    })
  })
})
