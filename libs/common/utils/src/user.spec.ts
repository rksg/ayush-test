import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

import { userLogout } from './user'

describe('userLogout', () => {
  describe('R1', () => {
    const { location } = window
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...location, href: new URL('https://url/').href }
      })
    })
    afterEach(() => {
      Object.defineProperty(window, 'location', { writable: true, value: { location } })
    })

    it('should logout correctly', () => {
      // Object.keys(localStorage) does not return set items in tests so we need to monkey patch it
      const mockedRemoveItem = jest.fn()
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = mockedRemoveItem
      localStorage['SPLITIO-foo'] = 'bar'
      localStorage['table-pagesize'] = '20'
      sessionStorage.setItem('jwt', 'testToken')
      sessionStorage.setItem('ACX-ap-compatibiliy-note-hidden', 'true')
      sessionStorage.setItem('table-pagesize', '20')

      userLogout()
      expect(window.location.href).toEqual('/logout?token=testToken')
      expect(sessionStorage.getItem('jwt')).toBeNull()
      expect(sessionStorage.getItem('ACX-ap-compatibiliy-note-hidden')).toBeNull()
      expect(sessionStorage.getItem('table-pagesize')).toBeNull()
      expect(mockedRemoveItem).toHaveBeenCalledWith('SPLITIO-foo')

      delete localStorage['SPLITIO-foo']
      delete localStorage['table-pagesize']
      localStorage.removeItem = originalRemoveItem
    })

    it('should logout without token', () => {
      userLogout()
      expect(window.location.href).toEqual('/logout')
    })
  })

  describe('RA', () => {
    const { location } = window
    let originalAppendChild: typeof document.body.appendChild
    let originalCreateElement: typeof document.createElement
    let mockedForm: HTMLFormElement

    beforeEach(async () => {
      process.env.NX_IS_MLISA_SA = 'true'
      jest.resetModules()
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...location,
          search: '?selectedTenants=WyIwMDE1MDAwMDAwR2xJN1NBQVYiXQ=='
        }
      })
      mockServer.resetHandlers()
      mockServer.use(
        rest.get(`${document.baseURI}globalValues.json`, (_, res, ctx) => res(ctx.json({
          MLISA_LOGOUT_URL: '/logout'
        })))
      )
      const { initialize } = require('@acx-ui/config')
      await initialize()
      originalAppendChild = document.body.appendChild
      originalCreateElement = document.createElement
      document.body.appendChild = jest.fn()
      mockedForm = { submit: jest.fn() } as unknown as HTMLFormElement
      document.createElement = (tagName: string) => tagName === 'form'
        ? mockedForm
        : originalCreateElement.call(document, tagName)
    })
    afterEach(() => {
      Object.defineProperty(window, 'location', { writable: true, value: { location } })
      delete process.env.NX_IS_MLISA_SA
      document.createElement = originalCreateElement
      document.body.appendChild = originalAppendChild
    })

    it('should logout correctly', async () => {
      const { userLogout: raUserLogout } = require('./user')
      sessionStorage.setItem('jwt', 'testToken')
      raUserLogout()
      expect(mockedForm.action)
        .toEqual('/logout?selectedTenants=WyIwMDE1MDAwMDAwR2xJN1NBQVYiXQ==&token=testToken')
      expect(mockedForm.method).toEqual('POST')
      expect(mockedForm.submit).toHaveBeenCalled()
      expect(document.body.appendChild).toHaveBeenCalledWith(mockedForm)
      expect(sessionStorage.getItem('jwt')).toBeNull()
    })

    it('should logout without token', () => {
      const { userLogout: raUserLogout } = require('./user')
      raUserLogout()
      expect(mockedForm.action)
        .toEqual('/logout?selectedTenants=WyIwMDE1MDAwMDAwR2xJN1NBQVYiXQ==')
    })

    it('should logout without query parameters', () => {
      const { userLogout: raUserLogout } = require('./user')
      Object.defineProperty(window, 'location', { writable: true, value: { location } })
      raUserLogout()
      expect(mockedForm.action)
        .toEqual('/logout')
    })
  })
})
