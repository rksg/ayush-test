import {
  EdgeMultiWanModeEnum,
  EdgeMultiWanProtocolEnum
} from '@acx-ui/rc/utils'
import { EdgeLinkDownCriteriaEnum } from '@acx-ui/rc/utils'

import {
  getDualWanModeString,
  getWanProtocolString,
  getWanLinkDownCriteriaString,
  getDisplayWanRole
} from './dualWanUtils'

describe('getDualWanModeString', () => {
  it('returns the correct string for ACTIVE_BACKUP', () => {
    const result = getDualWanModeString(EdgeMultiWanModeEnum.ACTIVE_BACKUP)
    expect(result).toBe('Active / Backup')
  })

  it('returns an empty string for NONE', () => {
    const result = getDualWanModeString(EdgeMultiWanModeEnum.NONE)
    expect(result).toBe('')
  })

  it('returns an empty string for an invalid enum value', () => {
    const result = getDualWanModeString('INVALID_VALUE' as EdgeMultiWanModeEnum)
    expect(result).toBe('')
  })

  it('returns an empty string for undefined', () => {
    const result = getDualWanModeString()
    expect(result).toBe('')
  })
})

describe('getWanProtocolString', () => {
  it('returns "Ping" for EdgeMultiWanProtocolEnum.PING', () => {
    const result = getWanProtocolString(EdgeMultiWanProtocolEnum.PING)
    expect(result).toBe('ICMP (Ping)')
  })

  it('returns empty string for EdgeMultiWanProtocolEnum.NONE', () => {
    const result = getWanProtocolString(EdgeMultiWanProtocolEnum.NONE)
    expect(result).toBe('')
  })

  it('returns empty string for invalid enum value', () => {
    const result = getWanProtocolString('INVALID_VALUE' as EdgeMultiWanProtocolEnum)
    expect(result).toBe('')
  })

  it('returns empty string for null or undefined input', () => {
    const result1 = getWanProtocolString(null)
    const result2 = getWanProtocolString(undefined)
    expect(result1).toBe('')
    expect(result2).toBe('')
  })
})

describe('getWanLinkDownCriteriaString', () => {
  it('returns correct string for ALL_TARGETS_DOWN', () => {
    const result = getWanLinkDownCriteriaString(EdgeLinkDownCriteriaEnum.ALL_TARGETS_DOWN)
    expect(result).toBe('All targets were unreachable')
  })

  it('returns correct string for ANY_TARGET_DOWN', () => {
    const result = getWanLinkDownCriteriaString(EdgeLinkDownCriteriaEnum.ANY_TARGET_DOWN)
    expect(result).toBe('One or more of the targets were unreachable')
  })

  it('returns empty string for INVALID', () => {
    const result = getWanLinkDownCriteriaString(EdgeLinkDownCriteriaEnum.INVALID)
    expect(result).toBe('')
  })

  it('returns empty string for invalid enum value', () => {
    // eslint-disable-next-line max-len
    const result = getWanLinkDownCriteriaString('INVALID_ENUM_VALUE' as unknown as EdgeLinkDownCriteriaEnum)
    expect(result).toBe('')
  })
})

describe('getDisplayWanRole', () => {
  it('should return an empty string for priority 0', () => {
    expect(getDisplayWanRole(0)).toBe('')
  })

  it('should return "Active" for priority 1', () => {
    expect(getDisplayWanRole(1)).toBe('Active')
  })

  it('should return "Backup" for priority other than 0 or 1', () => {
    expect(getDisplayWanRole(2)).toBe('Backup')
    expect(getDisplayWanRole(3)).toBe('Backup')
    expect(getDisplayWanRole(-1)).toBe('Backup')
  })
})