import { TunnelTypeEnum } from '@acx-ui/rc/utils'

export const getTunnelTypeDisplayName = (tunnelType?: TunnelTypeEnum) => {
  switch (tunnelType) {
    case TunnelTypeEnum.L2GRE:
      return 'L2GRE'
    case TunnelTypeEnum.VXLAN_GPE:
      return 'VxLAN'
    default:
      return tunnelType
  }
}
