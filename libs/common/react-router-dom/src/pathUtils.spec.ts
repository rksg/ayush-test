import * as locationUtils from './locationUtils'
import * as pathUtils     from './pathUtils'

describe('common path utils', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('resolveTenantTypeFromPath', () => {
    it('should return "v" when path starts with /v', () => {
      // eslint-disable-next-line max-len
      jest.spyOn(locationUtils, 'getLocationPathname').mockReturnValue('/dc2146381a874d04a824bdd8c7bb991d/v/configTemplates/templates')
      expect(pathUtils.resolveTenantTypeFromPath()).toBe('v')
    })

    it('should return "t" when path starts with /t', () => {
      // eslint-disable-next-line max-len
      jest.spyOn(locationUtils, 'getLocationPathname').mockReturnValue('/dc2146381a874d04a824bdd8c7bb991d/t/venues')
      expect(pathUtils.resolveTenantTypeFromPath()).toBe('t')
    })

    it('should return "t" for unknown path', () => {
      jest.spyOn(locationUtils, 'getLocationPathname').mockReturnValue('/abc/xyz/...')
      expect(pathUtils.resolveTenantTypeFromPath()).toBe('t')
    })
  })

  describe('isRecSite', () => {
    it('should return true when path is /t', () => {
      // eslint-disable-next-line max-len
      jest.spyOn(locationUtils, 'getLocationPathname').mockReturnValue('/dc2146381a874d04a824bdd8c7bb991d/t/venues')
      expect(pathUtils.isRecSite()).toBe(true)
    })

    it('should return false when path is /v', () => {
      // eslint-disable-next-line max-len
      jest.spyOn(locationUtils, 'getLocationPathname').mockReturnValue('/dc2146381a874d04a824bdd8c7bb991d/v/configTemplates/templates')
      expect(pathUtils.isRecSite()).toBe(false)
    })
  })
})
