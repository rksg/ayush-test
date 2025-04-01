import {
  EdgeMultiWanModeEnum,
  EdgeMultiWanProtocolEnum
} from '@acx-ui/rc/utils'
import { EdgeLinkDownCriteriaEnum } from '@acx-ui/rc/utils'

import { getDualWanModeString, getWanProtocolString, getWanLinkDownCriteriaString } from './dualWanUtils'

describe('getDualWanModeString', () => {
  it('returns the correct string for ACTIVE_BACKUP', () => {
    const result = getDualWanModeString(EdgeMultiWanModeEnum.ACTIVE_BACKUP)
    expect(result).toBe('Aactive / Backup')
  })

  it('returns an empty string for NONE', () => {
    const result = getDualWanModeString(EdgeMultiWanModeEnum.NONE)
    expect(result).toBe('')
  })

  it('returns an empty string for an invalid enum value', () => {
    const result = getDualWanModeString('INVALID_VALUE' as EdgeMultiWanModeEnum)
    expect(result).toBe('')
  })
})

describe('getWanProtocolString', () => {
  it('returns "Ping" for EdgeMultiWanProtocolEnum.PING', () => {
    const result = getWanProtocolString(EdgeMultiWanProtocolEnum.PING)
    expect(result).toBe('Ping')
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
    expect(result).toBe('All destinations were unreachable')
  })

  it('returns correct string for ANY_TARGET_DOWN', () => {
    const result = getWanLinkDownCriteriaString(EdgeLinkDownCriteriaEnum.ANY_TARGET_DOWN)
    expect(result).toBe('One or more of the destinations were unreachable')
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