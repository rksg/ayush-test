import { defineMessage, MessageDescriptor } from 'react-intl'

import { LldpTlvMatchingType } from '@acx-ui/rc/utils'

export const lldpTlvMatchingTypeTextMap: Record<LldpTlvMatchingType, MessageDescriptor> = {
  [LldpTlvMatchingType.FULL_MAPPING]: defineMessage({ defaultMessage: 'Exact' }),
  [LldpTlvMatchingType.BEGIN]: defineMessage({ defaultMessage: 'Begin with' }),
  [LldpTlvMatchingType.INCLUDE]: defineMessage({ defaultMessage: 'Include' })
}