import { IntlShape } from 'react-intl'

import { EdgeServiceTypeEnum } from '@acx-ui/rc/utils'

export const getEdgeServiceTypeString = ($t: IntlShape['$t'], type: EdgeServiceTypeEnum) => {
  switch (type) {
    case EdgeServiceTypeEnum.DHCP:
      return $t({ defaultMessage: 'DHCP' })
    case EdgeServiceTypeEnum.FIREWALL:
      return $t({ defaultMessage: 'Firewall' })
    case EdgeServiceTypeEnum.NETWORK_SEGMENTATION:
      return $t({ defaultMessage: 'Network Segmentation' })
    default:
      return ''
  }
}