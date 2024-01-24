import { EdgeServiceStatusEnum, EdgeStatusEnum } from '../../models/EdgeEnum'

import { EdgeAlarmFixtures }                                               from './__tests__/fixtures'
import { allowRebootForStatus, allowResetForStatus, getEdgeServiceHealth } from './edgeUtils'

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
})