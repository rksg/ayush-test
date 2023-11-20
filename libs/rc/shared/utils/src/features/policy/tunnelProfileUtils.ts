import { IntlShape } from 'react-intl'

import { TunnelTypeEnum }        from '../../models'
import { TunnelProfileViewData } from '../../types/policies/tunnelProfile'

export const isDefaultTunnelProfile = (profile: TunnelProfileViewData, tenantId: string) => {
  return profile.id === tenantId
}

export const getTunnelTypeString = ($t: IntlShape['$t'], type: TunnelTypeEnum) => {
  switch (type) {
    case TunnelTypeEnum.VXLAN:
      return $t({ defaultMessage: 'VxLAN' })
    case TunnelTypeEnum.VLAN_VXLAN:
      return $t({ defaultMessage: 'VLAN-VxLAN' })
    default:
      return ''
  }
}

export const getTunnelTypeOptions = ($t: IntlShape['$t'])
: Array<{ label: string, value: TunnelTypeEnum }> => {
  return Object.keys(TunnelTypeEnum)
    .map(key => ({
      label: getTunnelTypeString($t, key as TunnelTypeEnum),
      value: key as TunnelTypeEnum
    }))
}
