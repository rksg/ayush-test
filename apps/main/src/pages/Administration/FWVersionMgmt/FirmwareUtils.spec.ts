import {
  FirmwareCategory,
  FirmwareType,
  Schedule,
  SkippedVersion,
  VenueUpdateAdvice,
  VersionHistory
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { compareABFSequence, compareVersions, getApVersion, getVersionLabel } from './FirmwareUtils'


describe('FirmwareUtils parser', () => {

  it('should compare versions', () => {
    const mockedAVersion = '6.2.0.103.514'
    const mockedBVersion = '6.2.0.103.544'
    expect(compareVersions(mockedBVersion, mockedAVersion) > 0).toBe(true)
  })

  it('should get AP version', () => {
    const mockedFirmwareVenue = {
      id: 'test',
      name: 'test',
      versions: [
        {
          version: '6.2.1.103.1580',
          type: 'AP_FIRMWARE_UPGRADE' as FirmwareType,
          category: 'RECOMMENDED' as FirmwareCategory
        }
      ],
      updatedAdvice: {} as VenueUpdateAdvice,
      availableVersions: [
        {
          version: '6.2.1.103.1580',
          type: 'AP_FIRMWARE_UPGRADE' as FirmwareType,
          category: 'RECOMMENDED' as FirmwareCategory
        }
      ],
      nextSchedules: [] as Schedule[],
      lastSkippedVersions: [] as SkippedVersion[],
      versionHistory: [] as VersionHistory[],
      lastScheduleUpdate: 'test'
    }
    expect(getApVersion(mockedFirmwareVenue)).toBe('6.2.1.103.1580')
  })

  it('should get version label', () => {
    const mockedFirmwareVersion = {
      id: 'test',
      name: 'test',
      version: '6.2.1.103.1580',
      type: 'AP_FIRMWARE_UPGRADE' as FirmwareType,
      category: 'RECOMMENDED' as FirmwareCategory
    }
    expect(getVersionLabel(getIntl(), mockedFirmwareVersion)).toBe('test (Release - Recommended) ')
    expect(getVersionLabel(getIntl(), mockedFirmwareVersion, false)).toBe('test ')
  })

  it('should compare the ABF sequence', () => {
    expect(compareABFSequence(3, 2)).toBeGreaterThan(0)
    expect(compareABFSequence(5)).toBeGreaterThan(0)
    expect(compareABFSequence(undefined, 5)).toBeLessThan(0)
    expect(compareABFSequence(2, 3)).toBeLessThan(0)
    expect(compareABFSequence(2, 2)).toBe(0)
    expect(compareABFSequence(undefined, undefined)).toBe(0)
  })
})
