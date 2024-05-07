import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

import { userLogout } from './user'

describe('userLogout', () => {
  describe('R1', () => {
    const { location: originalLocation } = window
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        enumerable: true,
        value: { href: new URL('https://url/').href }
      })
    })
    afterEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true, enumerable: true, value: originalLocation
      })
    })

    it('should logout correctly', () => {
      // Object.keys(localStorage) does not return set items in tests so we need to monkey patch it
      const mockedRemoveItem = jest.fn()
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = mockedRemoveItem
      localStorage['SPLITIO-foo'] = 'bar'
      sessionStorage.setItem('jwt', 'testToken')
      sessionStorage.setItem('ACX-ap-compatibiliy-note-hidden', 'true')

      userLogout()
      expect(window.location.href).toEqual('/logout?token=testToken')
      expect(sessionStorage.getItem('jwt')).toBeNull()
      expect(sessionStorage.getItem('ACX-ap-compatibiliy-note-hidden')).toBeNull()
      expect(mockedRemoveItem).toHaveBeenCalledWith('SPLITIO-foo')

      delete localStorage['SPLITIO-foo']
      localStorage.removeItem = originalRemoveItem
    })

    it('should logout without token', () => {
      userLogout()
      expect(window.location.href).toEqual('/logout')
    })
  })

  describe('RA', () => {
    beforeEach(async () => {
      process.env.NX_IS_MLISA_SA = 'true'
      const env = { MLISA_LOGOUT_URL: '/logout' }
      jest.resetModules()
      mockServer.resetHandlers()
      mockServer.use(
        rest.get(`${document.baseURI}globalValues.json`, (_, res, ctx) => res(ctx.json(env)))
      )
      const { initialize } = require('@acx-ui/config')
      await initialize()
    })
    afterEach(() => {
      delete process.env.NX_IS_MLISA_SA
    })

    it('should logout correctly', async () => {
      const { userLogout: raUserLogout } = require('./user')

      const originalAppendChild = document.body.appendChild
      document.body.appendChild = jest.fn()
      const mockedForm = {
        submit: jest.fn()
      } as unknown as HTMLFormElement
      jest.spyOn(document, 'createElement').mockReturnValue(mockedForm)

      raUserLogout()
      expect(mockedForm.action).toEqual('/logout')
      expect(mockedForm.method).toEqual('POST')
      expect(mockedForm.submit).toHaveBeenCalled()
      expect(document.body.appendChild).toHaveBeenCalledWith(mockedForm)

      document.body.appendChild = originalAppendChild
    })
  })
})
