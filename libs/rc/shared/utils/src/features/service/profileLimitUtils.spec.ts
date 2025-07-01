import { ServiceType } from '../..'

import { getServiceProfileMaximumNumber, getServiceProfileLimitReachedMessage } from './profileLimitUtils'

describe('profileLimitUtils', () => {
  describe('getServiceProfileMaximumNumber', () => {
    it('should return 5 for WIFI_CALLING', () => {
      expect(getServiceProfileMaximumNumber(ServiceType.WIFI_CALLING)).toBe(5)
    })

    it('should return 32 for unknown service type', () => {
      expect(getServiceProfileMaximumNumber('UNKNOWN' as ServiceType)).toBe(32)
    })
  })

  describe('getServiceProfileLimitReachedMessage', () => {
    it('should return correct message for WIFI_CALLING', () => {
      const msg = getServiceProfileLimitReachedMessage(ServiceType.WIFI_CALLING)
      expect(msg).toContain('5')
    })

    it('should return correct message for unknown service type', () => {
      const msg = getServiceProfileLimitReachedMessage('UNKNOWN' as ServiceType)
      expect(msg).toContain('32')
    })
  })
})
