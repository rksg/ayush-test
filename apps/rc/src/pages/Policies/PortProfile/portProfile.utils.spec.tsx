/* eslint-disable max-len */
import { LldpTlvMatchingType } from '@acx-ui/rc/utils'

import { lldpTlvMatchingTypeTextMap } from './portProfile.utils'

describe('lldpTlvMatchingTypeTextMap', () => {
  it('should have the correct message descriptors for each LldpTlvMatchingType', () => {
    expect(lldpTlvMatchingTypeTextMap[LldpTlvMatchingType.FULL_MAPPING].defaultMessage?.[0]).toMatchObject({ type: 0, value: 'Exact' })
    expect(lldpTlvMatchingTypeTextMap[LldpTlvMatchingType.BEGIN].defaultMessage?.[0]).toMatchObject({ type: 0, value: 'Begin with' })
    expect(lldpTlvMatchingTypeTextMap[LldpTlvMatchingType.INCLUDE].defaultMessage?.[0]).toMatchObject({ type: 0, value: 'Include' })
  })
})