import { EdgeServiceStatusEnum, EdgeStatusEnum } from '../../models/EdgeEnum'

import { EdgeAlarmFixtures }                                                                                                                 from './__tests__/fixtures'
import { allowRebootForStatus, allowResetForStatus, edgeSerialNumberValidator, getEdgeServiceHealth, getIpWithBitMask, getSuggestedIpRange } from './edgeUtils'

const { requireAttentionAlarmSummary, poorAlarmSummary } = EdgeAlarmFixtures
describe('Edge utils', () => {

  it('should get good service health', () => {
    const serviceHealth = getEdgeServiceHealth([])
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.GOOD)
  })

  it('should get require attention service health', () => {
    const serviceHealth = getEdgeServiceHealth(requireAttentionAlarmSummary)
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.REQUIRES_ATTENTION)
  })

  it('should get poor service health', () => {
    const serviceHealth = getEdgeServiceHealth(poorAlarmSummary)
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.POOR)
  })

  it('should get unknown service health', () => {
    const serviceHealth = getEdgeServiceHealth(undefined)
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.UNKNOWN)
  })

  it('reboot & reset should be allowed only for a set of specific statuses', () => {
    Object.values(EdgeStatusEnum).forEach(status => {
      expect(allowRebootForStatus(status)).toBe(status === EdgeStatusEnum.OPERATIONAL ||
        status === EdgeStatusEnum.APPLYING_CONFIGURATION ||
        status === EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED ||
        status === EdgeStatusEnum.FIRMWARE_UPDATE_FAILED)

      expect(allowResetForStatus(status)).toBe(status === EdgeStatusEnum.OPERATIONAL ||
        status === EdgeStatusEnum.APPLYING_CONFIGURATION ||
        status === EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED ||
        status === EdgeStatusEnum.FIRMWARE_UPDATE_FAILED)
    })
  })

  it('should getIpWithBitMask correctly', () => {
    const result = getIpWithBitMask('192.168.1.2', '255.255.255.0')
    expect(result).toBe('192.168.1.2/ 24')
  })

  it('should getSuggestedIpRange correctly', () => {
    const result = getSuggestedIpRange('192.168.1.2', '255.255.255.0')
    expect(result).toBe('192.168.1.0/ 24')
  })

  it('Test validate serial number success', async () => {
    const result = await edgeSerialNumberValidator('9612345678901234567890111123456110')
    expect(result).toBeUndefined()
  })

  it('Test validate serial number failed', async () => {
    let error
    try {
      await edgeSerialNumberValidator('9612345')
    } catch (ex) {
      error = ex
    }
    expect(error).toBe('Field must be exactly 34 characters')
    try {
      await edgeSerialNumberValidator('123')
    } catch (ex) {
      error = ex
    }
    expect(error).toBe('This field is invalid')
    try {
      await edgeSerialNumberValidator('AB12345678901234567890111123456110')
    } catch (ex) {
      error = ex
    }
    expect(error).toBe('This field is invalid')
  })
})