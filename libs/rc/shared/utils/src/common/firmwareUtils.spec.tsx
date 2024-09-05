import { getIntl } from '@acx-ui/utils'

import { FirmwareCategory, FirmwareType } from '../types/firmware'

import { getFirmwareVersionLabel } from './firmwareUtils'

describe('getFirmwareVersionLabel', () => {
  it('should get version label', () => {
    const mockedFirmwareVersion = {
      id: 'test',
      name: 'test',
      version: '6.2.1.103.1580',
      type: 'AP_FIRMWARE_UPGRADE' as FirmwareType,
      category: 'RECOMMENDED' as FirmwareCategory
    }
    // eslint-disable-next-line max-len
    expect(getFirmwareVersionLabel(getIntl(), mockedFirmwareVersion)).toBe('test (Release - Recommended) ')
    expect(getFirmwareVersionLabel(getIntl(), mockedFirmwareVersion, false)).toBe('test ')
  })
})
