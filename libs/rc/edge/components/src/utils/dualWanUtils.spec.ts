import {
  EdgeMultiWanModeEnum
} from '@acx-ui/rc/utils'

import { getDualWanModeString } from './dualWanUtils'

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