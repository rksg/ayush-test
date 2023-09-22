import {
  FirmwareCategory,
  FirmwareType,
  Schedule,
  SkippedVersion,
  VenueUpdateAdvice,
  VersionHistory
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { compareVersions, compareSwitchVersion, getApVersion, getVersionLabel, parseSwitchVersion } from './FirmwareUtils'


describe('FirmwareUtils parser', () => {

  it('should compare versions', () => {
    const mockedAVersion = '6.2.0.103.514'
    const mockedBVersion = '6.2.0.103.544'
    expect(compareVersions(mockedBVersion, mockedAVersion) > 0).toBe(true)
  })

  it('should compare switch versions', () => {
    expect(compareSwitchVersion('09010e', '09010f_b5') < 0).toBe(true)
    expect(compareSwitchVersion('09010e_b5', '09010e_b392') < 0).toBe(true)
    expect(compareSwitchVersion('', '') === 0).toBe(true)

    // compare rc with others
    expect(compareSwitchVersion('10010_rc2', '10010_rc3')).toBe(-1)
    expect(compareSwitchVersion('10010_b3', '10010_rc2')).toBe(-1)
    expect(compareSwitchVersion('10010_rc2', '10010e')).toBe(0)
    expect(compareSwitchVersion('10010_cd2', '10010_rc2')).toBe(0)
    expect(compareSwitchVersion('RDR10010', '10010_rc2')).toBe(0)

    expect(compareSwitchVersion('10010_cd2', '10010_b10')).toBe(1)
    expect(compareSwitchVersion('10010_cd2_b11', '10010_cd3_b10')).toBe(-1)
    expect(compareSwitchVersion('10010_cd3_b11', '10010_cd3')).toBe(-1)
    expect(compareSwitchVersion('10010_cd3_b11', '10010_cd3_b22')).toBe(-1)

    // copy form VersionUtilTest.java
    expect(compareSwitchVersion('10010a_b3', '10010a_cd1_b3')).toBe(-1)
    expect(compareSwitchVersion('10010b_b36', '10010a_cd1_b3')).toBe(1)
    expect(compareSwitchVersion('10010b_b36', '10010b_cd1')).toBe(-1)

    expect(compareSwitchVersion('10010b_b36', '9010')).toBe(1)
    expect(compareSwitchVersion('09010f_b19', '10010a')).toBe(-1)
    expect(compareSwitchVersion('10010b_b36', '10010a')).toBe(1)
    expect(compareSwitchVersion('10010b_b36', '10000')).toBe(1)

    expect(compareSwitchVersion('09010h_rc80', '9010h')).toBe(0)
    expect(compareSwitchVersion('09010h_rc80', '9010i')).toBe(0)
    expect(compareSwitchVersion('09010h_rc80', '09010h_b28')).toBe(1)
    expect(compareSwitchVersion('09010h_rc80', '09010h_rc3')).toBe(1)
    expect(compareSwitchVersion('09010h_b28', '09010h_rc80')).toBe(-1)
    expect(compareSwitchVersion('09010h_rc200', '09010h_rc80')).toBe(1)
    expect(compareSwitchVersion('09010h_b333', '09010h_b28')).toBe(1)
    expect(compareSwitchVersion('09010h_rc80', '09010h_cd1_b2')).toBe(1)
    expect(compareSwitchVersion('09010h_cd1_rc80', '09010h_cd1_b2')).toBe(1)
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

  it('should parse switch version', () => {
    expect(parseSwitchVersion('')).toBe('')
    expect(parseSwitchVersion('09010f_b19')).toBe('9.0.10f')
    expect(parseSwitchVersion('09010f_b20')).toBe('9.0.10f_b20')
    expect(parseSwitchVersion('10010_rc3')).toBe('10.0.10')
    expect(parseSwitchVersion('10010_rc4')).toBe('10.0.10_rc4')
    expect(parseSwitchVersion('10010a_b36')).toBe('10.0.10a')
    expect(parseSwitchVersion('10010a_cd3_b11')).toBe('10.0.10a_cd3')
  })
})
