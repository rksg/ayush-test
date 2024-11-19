import { IntlShape } from 'react-intl'

import { EdgeServiceTypeEnum } from '@acx-ui/rc/utils'

export const getEdgeServiceTypeString = ($t: IntlShape['$t'], type: EdgeServiceTypeEnum) => {
  switch (type) {
    case EdgeServiceTypeEnum.DHCP:
      return $t({ defaultMessage: 'DHCP' })
    case EdgeServiceTypeEnum.FIREWALL:
      return $t({ defaultMessage: 'Firewall' })
    case EdgeServiceTypeEnum.PIN:
      return $t({ defaultMessage: 'Personal Identity Network' })
    case EdgeServiceTypeEnum.SD_LAN:
      return $t({ defaultMessage: 'SD-LAN' })
    case EdgeServiceTypeEnum.MDNS_PROXY:
      return $t({ defaultMessage: 'mDNS Proxy' })
    default:
      return ''
  }
}
