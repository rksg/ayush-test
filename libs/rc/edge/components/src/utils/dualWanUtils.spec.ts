import {
  EdgeMultiWanModeEnum,
  EdgeMultiWanProtocolEnum
} from '@acx-ui/rc/utils'
import { EdgeLinkDownCriteriaEnum }  from '@acx-ui/rc/utils'
import { EdgeWanPortRoleStatusEnum } from '@acx-ui/rc/utils'

import {
  getDualWanModeString,
  getWanProtocolString,
  getWanLinkDownCriteriaString,
  getDisplayWanRole
} from './dualWanUtils'
import { getWanLinkStatusString } from './dualWanUtils'

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

  it('returns -- for EdgeMultiWanProtocolEnum.NONE', () => {
    const result = getWanProtocolString(EdgeMultiWanProtocolEnum.NONE)
    expect(result).toBe('--')
  })

  it('returns -- for invalid enum value', () => {
    const result = getWanProtocolString('INVALID_VALUE' as EdgeMultiWanProtocolEnum)
    expect(result).toBe('--')
  })

  it('returns -- for null or undefined input', () => {
    const result1 = getWanProtocolString(null)
    const result2 = getWanProtocolString(undefined)
    expect(result1).toBe('--')
    expect(result2).toBe('--')
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

  it('returns -- for INVALID', () => {
    const result = getWanLinkDownCriteriaString(EdgeLinkDownCriteriaEnum.INVALID)
    expect(result).toBe('--')
  })

  it('returns -- for invalid enum value', () => {
    // eslint-disable-next-line max-len
    const result = getWanLinkDownCriteriaString('INVALID_ENUM_VALUE' as unknown as EdgeLinkDownCriteriaEnum)
    expect(result).toBe('--')
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

describe('getWanLinkStatusString', () => {
  it('returns "Active" for ACTIVE status', () => {
    const result = getWanLinkStatusString(EdgeWanPortRoleStatusEnum.ACTIVE)
    expect(result).toBe('Active')
  })

  it('returns "Backup" for BACKUP status', () => {
    const result = getWanLinkStatusString(EdgeWanPortRoleStatusEnum.BACKUP)
    expect(result).toBe('Backup')
  })

  it('returns -- for INVALID status', () => {
    const result = getWanLinkStatusString(EdgeWanPortRoleStatusEnum.INVALID)
    expect(result).toBe('--')
  })

  it('returns -- for undefined status', () => {
    const result = getWanLinkStatusString(undefined)
    expect(result).toBe('--')
  })

  it('returns -- for an invalid enum value', () => {
    const result = getWanLinkStatusString('INVALID_ENUM_VALUE' as EdgeWanPortRoleStatusEnum)
    expect(result).toBe('--')
  })
})