import {
  FirmwareCategory, FirmwareLabel,
  FirmwareType,
  Schedule,
  SkippedVersion,
  VenueUpdateAdvice,
  VersionHistory
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import {
  compareABFSequence,
  compareVersions, convertToPayloadForApModelFirmware,
  getApVersion,
  getVersionLabel, patchPayloadForApModelFirmware
} from './FirmwareUtils'


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

  it('should get version label with alpha or beta', () => {
    const mockedFirmwareVersion = {
      id: 'test-early-access',
      name: 'test-early-access',
      version: '6.2.1.103.1580',
      labels: [FirmwareLabel.ALPHA],
      type: 'AP_FIRMWARE_UPGRADE' as FirmwareType,
      category: 'RECOMMENDED' as FirmwareCategory
    }
    // eslint-disable-next-line max-len
    expect(getVersionLabel(getIntl(), mockedFirmwareVersion)).toBe('test-early-access (Early Access) ')
    expect(getVersionLabel(getIntl(), mockedFirmwareVersion, false)).toBe('test-early-access ')
  })

  it('should compare the ABF sequence', () => {
    expect(compareABFSequence(3, 2)).toBeGreaterThan(0)
    expect(compareABFSequence(5)).toBeGreaterThan(0)
    expect(compareABFSequence(undefined, 5)).toBeLessThan(0)
    expect(compareABFSequence(2, 3)).toBeLessThan(0)
    expect(compareABFSequence(2, 2)).toBe(0)
    expect(compareABFSequence(undefined, undefined)).toBe(0)
  })

  it('convertToPayloadForApModelFirmware: should covert success', () => {
    const mockedDisplayData = [
      {
        apModel: 'R550',
        versionOptions: [
          {
            key: '7.1.1.520.192',
            label: '7.1.1.520.192 (Early Access) - 12/23/2024',
            releaseDate: '2024-12-24T02:56:21.757+00:00'
          }
        ],
        extremeFirmware: '6.2.1.103.1580',
        defaultVersion: '7.1.1.520.192'
      }
    ]
    expect(convertToPayloadForApModelFirmware(mockedDisplayData)).toEqual([
      {
        apModel: 'R550',
        firmware: '7.1.1.520.192'
      }
    ])
  })

  // eslint-disable-next-line max-len
  it('patchPayloadForApModelFirmware: should update the firmware if the apModel already exists', () => {
    const mockedTargetFirmwares = [
      {
        apModel: 'R550',
        firmware: '7.1.1.520.192'
      }
    ]
    expect(patchPayloadForApModelFirmware(mockedTargetFirmwares, 'R550', '7.1.1.520.209')).toEqual([
      {
        apModel: 'R550',
        firmware: '7.1.1.520.209'
      }
    ])
  })

  it('patchPayloadForApModelFirmware: should update the firmware', () => {
    const mockedTargetFirmwares = [
      {
        apModel: 'R560',
        firmware: '7.1.1.520.209'
      }
    ]
    expect(patchPayloadForApModelFirmware(mockedTargetFirmwares, 'R550', '7.1.1.520.209')).toEqual([
      {
        apModel: 'R560',
        firmware: '7.1.1.520.209'
      },
      {
        apModel: 'R550',
        firmware: '7.1.1.520.209'
      }
    ])
  })
})
