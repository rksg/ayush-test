
import { isValidColorHex } from './residentPortalUtilities'

describe('ResidentPortal utility functions', () => {
  it('should return true for VALID hex color codes', () => {
    expect(isValidColorHex('#fff')).toBeTruthy()
    expect(isValidColorHex('#fFff')).toBeTruthy()
    expect(isValidColorHex('#AfAfAf')).toBeTruthy()
    expect(isValidColorHex('#fAfAfAfA')).toBeTruthy()
  })

  it('should return false for INVALID hex color codes', () => {
    expect(isValidColorHex('ffff')).toBeFalsy()
    expect(isValidColorHex('fffff')).toBeFalsy()
    expect(isValidColorHex('ffff')).toBeFalsy()
    expect(isValidColorHex('fff')).toBeFalsy()
    expect(isValidColorHex('not-a-color')).toBeFalsy()
  })

})
