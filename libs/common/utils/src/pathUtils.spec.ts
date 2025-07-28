import { resolveTenantTypeFromPath } from './pathUtils'

describe('common path utils', () => {
  describe('resolveTenantTypeFromPath', () => {
    let originalLocation: Location

    beforeEach(() => {
      originalLocation = window.location
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      })
    })

    it('should return "v" when path starts with /v', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/dc2146381a874d04a824bdd8c7bb991d/v/configTemplates/templates'
        },
        writable: true
      })
      expect(resolveTenantTypeFromPath()).toBe('v')
    })

    it('should return "t" when path starts with /t', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/dc2146381a874d04a824bdd8c7bb991d/t/venues'
        },
        writable: true
      })
      expect(resolveTenantTypeFromPath()).toBe('t')
    })

    it('should return "t" for unknown path', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/abc/xyz/...'
        },
        writable: true
      })
      expect(resolveTenantTypeFromPath()).toBe('t')
    })

    it('should handle edge cases correctly', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/'
        },
        writable: true
      })
      expect(resolveTenantTypeFromPath()).toBe('t')

      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/dc2146381a874d04a824bdd8c7bb991d'
        },
        writable: true
      })
      expect(resolveTenantTypeFromPath()).toBe('t')

      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/dc2146381a874d04a824bdd8c7bb991d/x/something'
        },
        writable: true
      })
      expect(resolveTenantTypeFromPath()).toBe('t')
    })
  })
})