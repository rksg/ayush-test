import {
  getUserSettingsByPath,
  setDeepUserSettings,
  getProductKey,
  goToNotFound,
  goToNoPermission,
  isCoreTier
} from './utils'


const mockedUserSettings = {
  COMMON: {
    MSP: { nonVarMspOnboard: false }
  }
}

describe('user settings utility', () => {
  describe('getUserSettingsByPath', () => {
    it('should return data by given value path', () => {
      expect(getUserSettingsByPath(mockedUserSettings, 'COMMON$MSP')).toEqual(
        { nonVarMspOnboard: false }
      )
    })

    it('should return data by given deeper value path', () => {
      expect(getUserSettingsByPath(mockedUserSettings, 'COMMON$MSP$nonVarMspOnboard'))
        .toEqual(false)
    })

    it('should return undefined when not found', () => {
      expect(getUserSettingsByPath(mockedUserSettings, 'COMMON$others')).toEqual(undefined)
    })

    it('should return undefined when using a invalida split character', () => {
      expect(getUserSettingsByPath(mockedUserSettings, 'COMMON#others')).toEqual(undefined)
    })
  })

  describe('setDeepUserSettings', () => {
    it('should update data by given value path and value', () => {
      expect(setDeepUserSettings(mockedUserSettings, 'COMMON$test', 'testValue')).toEqual({
        COMMON: {
          MSP: { nonVarMspOnboard: false },
          test: 'testValue'
        }
      })
    })


    it('should update data by given value path and nested value', () => {
      expect(setDeepUserSettings(mockedUserSettings, 'OTHERKEY$content', { other: 'text1' }))
        .toEqual({
          COMMON: {
            MSP: { nonVarMspOnboard: false }
          },
          OTHERKEY: {
            content: { other: 'text1' }
          }
        })
    })
  })

  describe('getProductKey', () => {
    it('should correctly return value', () => {
      expect(getProductKey('OTHERKEY$content')).toEqual('OTHERKEY')
    })

    it('should return empty string when given path is empty', () => {
      expect(getProductKey('')).toEqual('')
    })

    it('should return origin value when path is using invalid split character', () => {
      expect(getProductKey('INVALID#content')).toEqual('INVALID#content')
    })
  })

  describe('goToNotFound', () => {
    it('should return a TenantNavigate', () => {
      const result = goToNotFound()
      expect(result.type.name).toBe('TenantNavigate')
      expect(result.props.replace).toBeTruthy()
      expect(result.props.to).toBe('/not-found')
    })
  })

  describe('goToNoPermission', () => {
    it('should return a TenantNavigate', () => {
      const result = goToNoPermission()
      expect(result.type.name).toBe('TenantNavigate')
      expect(result.props.replace).toBeTruthy()
      expect(result.props.to).toBe('/no-permissions')
    })
  })

  describe('isCoreTier', () => {
    it('should return true if tier is CORE', () => {
      expect(isCoreTier('Silver')).toBe(true)
    })

    it('should return false if tier is not CORE', () => {
      expect(isCoreTier('PLATINUM')).toBe(false)
      expect(isCoreTier('GOLD')).toBe(false)
    })

    it('should return false if tier is undefined', () => {
      expect(isCoreTier(undefined)).toBe(false)
    })
  })
})
