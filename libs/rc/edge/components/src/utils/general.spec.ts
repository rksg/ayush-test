import { EdgeStatusSeverityEnum, ClusterHighAvailabilityModeEnum } from '@acx-ui/rc/utils'

import { getEdgeStatusDisplayName, getHaModeDisplayString } from './general'

describe('getEdgeStatusDisplayName', () => {
  it('should return the translated display name for a given label', () => {
    const label = EdgeStatusSeverityEnum.REQUIRES_ATTENTION
    const showSeverity = true
    const expectedDisplayName = '1 Requires Attention'
    const displayName = getEdgeStatusDisplayName(label, showSeverity)
    expect(displayName).toEqual(expectedDisplayName)
  })

  it('should return the translated display name with severity disabled', () => {
    const label = EdgeStatusSeverityEnum.TRANSIENT_ISSUE
    const showSeverity = false
    const expectedDisplayName = 'Transient Issue'
    const displayName = getEdgeStatusDisplayName(label, showSeverity)
    expect(displayName).toEqual(expectedDisplayName)
  })
})

describe('getHaModeDisplayString', () => {
  it('returns the correct string for active active', () => {
    const result = getHaModeDisplayString(ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE)
    expect(result.defaultMessage[0].value).toBe('Active-Active')
  })

  it('returns the correct string for active standby', () => {
    const result = getHaModeDisplayString(ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY)
    expect(result.defaultMessage[0].value).toBe('Active-Standby')
  })

  it('returns an empty string for an invalid enum value', () => {
    const result = getHaModeDisplayString('INVALID_VALUE' as EdgeMultiWanModeEnum)
    expect(result.defaultMessage[0].value).toBe('N/A')
  })
})