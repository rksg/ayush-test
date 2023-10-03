import {
  AuthenticationMethod,
  ClientType
} from './types'

describe('R1', () => {
  describe('authMethodsByClientType', () => {
    const { authMethodsByClientType } = require('./authMethods')
    Object.values(ClientType).forEach(type => {
      it(`${type} matches snapshot`, () => {
        const result = authMethodsByClientType[type]
        expect(result).toMatchSnapshot()
      })
    })
  })

  describe('authMethodsByCode', () => {
    const { authMethodsByCode } = require('./authMethods')
    Object.values(AuthenticationMethod).forEach(method => {
      it(`${method} matches snapshot`, () => {
        const result = authMethodsByCode[method]
        expect(result).toMatchSnapshot()
      })
    })
  })
})

describe('SA', () => {
  describe('authMethodsByClientType', () => {
    jest.resetModules()
    jest.doMock('@acx-ui/config', () => ({ get: jest.fn().mockReturnValue('true') }))
    const { authMethodsByClientType } = require('./authMethods')
    Object.values(ClientType).forEach(type => {
      it(`${type} matches snapshot`, () => {
        const result = authMethodsByClientType[type]
        expect(result).toMatchSnapshot()
      })
    })
  })

  describe('authMethodsByCode', () => {
    jest.resetModules()
    jest.doMock('@acx-ui/config', () => ({ get: jest.fn().mockReturnValue('true') }))
    const { authMethodsByCode } = require('./authMethods')
    Object.values(AuthenticationMethod).forEach(method => {
      it(`${method} matches snapshot`, () => {
        const result = authMethodsByCode[method]
        expect(result).toMatchSnapshot()
      })
    })
  })
})
