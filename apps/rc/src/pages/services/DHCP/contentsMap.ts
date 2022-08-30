import { defineMessage, MessageDescriptor } from 'react-intl'

import { DHCPConfigTypeEnum } from '@acx-ui/rc/utils'

export const dhcpTypes: Record<DHCPConfigTypeEnum, MessageDescriptor> = {
  [DHCPConfigTypeEnum.SIMPLE]: defineMessage({ defaultMessage: 'Simple DHCP' }),
  [DHCPConfigTypeEnum.MULTIPLE]: defineMessage({ defaultMessage: 'Multiple AP DHCP' }),
  [DHCPConfigTypeEnum.Hierarchical]: defineMessage({ defaultMessage: 'Hierarchical AP DHCP' })
}

export const dhcpTypesDesc: Record<DHCPConfigTypeEnum, MessageDescriptor> = {
  [DHCPConfigTypeEnum.SIMPLE]: defineMessage({
    defaultMessage: `Each AP in this venue is running it’s own DHCP server instance.
    Typically configured when APs are at different sites and roaming is not required` }),

  [DHCPConfigTypeEnum.MULTIPLE]: defineMessage({
    defaultMessage: `Designated APs in this venue are running the DHCP Server instance. Typically
    configured when multiple APs are at the same site and roaming across APs is needed` }),

  [DHCPConfigTypeEnum.Hierarchical]: defineMessage({
    defaultMessage: `Designated APs in this venue are running the DHCP Server instance.
    The DHCP server APs connected to the WAN, the rest of APs get their Private IP address
    from a local IP Pool with VLAN ID 1 from the DHCP Server AP` })
}
