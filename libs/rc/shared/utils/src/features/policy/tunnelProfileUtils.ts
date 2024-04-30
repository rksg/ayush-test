import { IntlShape } from 'react-intl'

import { getTenantId } from '@acx-ui/utils'

import { AgeTimeUnit, MtuTypeEnum, TunnelTypeEnum }                    from '../../models'
import { TunnelProfile, TunnelProfileViewData, TunnelProfileFormType } from '../../types/policies/tunnelProfile'

// eslint-disable-next-line max-len
export const isDefaultTunnelProfile = (profile: TunnelProfileViewData | TunnelProfile | undefined) => {
  return profile
    ? isVxlanDefaultTunnelProfile(profile.id) || isVlanVxlanDefaultTunnelProfile(profile.id)
    : false
}

export const isVxlanDefaultTunnelProfile = (id: string) => {
  const tenantId = getTenantId()
  return !!tenantId && id === tenantId
}

export const isVlanVxlanDefaultTunnelProfile = (id: string) => {
  const tenantId = getTenantId()
  return !!tenantId && id === `SL${tenantId}`
}

export const getVxlanDefaultTunnelProfileOpt = () => {
  const tenantId = getTenantId()
  return {
    value: tenantId ?? '',
    label: 'Default tunnel profile (PIN)'
  }
}

export const getVlanVxlanDefaultTunnelProfileOpt = () => {
  const tenantId = getTenantId()
  return {
    value: tenantId ? `SL${tenantId}` : '',
    label: 'Default tunnel profile (SD-LAN)'
  }
}

export const getTunnelProfileOptsWithDefault = (
  profiles: TunnelProfileViewData[] | undefined,
  targetType?: TunnelTypeEnum): { label: string, value: string }[] => {
  if (!profiles) return []

  const tenantId = getTenantId()
  const tunnelOpts = profiles.map(item => ({
    label: item.name, value: item.id
  }))
  const vxLanProfile = tunnelOpts.findIndex(item => item.value === tenantId)
  const vLanVxLanProfile = tunnelOpts.findIndex(item => item.value === `SL${tenantId}`)
  const vxlanDefault = getVxlanDefaultTunnelProfileOpt()
  const vlanVxLanDefault = getVlanVxlanDefaultTunnelProfileOpt()

  if (vxLanProfile === -1 && (!targetType || targetType === TunnelTypeEnum.VXLAN))
    tunnelOpts.push(vxlanDefault)

  if (vLanVxLanProfile === -1 && (!targetType || targetType === TunnelTypeEnum.VLAN_VXLAN))
    tunnelOpts.push(vlanVxLanDefault)

  return tunnelOpts
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

export const ageTimeUnitConversion = (ageTimeMinutes?: number):
{ value: number, unit: AgeTimeUnit } | undefined => {
  if(!ageTimeMinutes) return undefined

  if (ageTimeMinutes % 10080 === 0) {
    return {
      value: ageTimeMinutes / 10080,
      unit: AgeTimeUnit.WEEK
    }
  } else if (ageTimeMinutes % 1440 === 0) {
    return {
      value: ageTimeMinutes / 1440,
      unit: AgeTimeUnit.DAYS
    }
  } else {
    return {
      value: ageTimeMinutes,
      unit: AgeTimeUnit.MINUTES
    }
  }
}

const DEFAULT_AGE_TIME_MIN = 20
export const tunnelProfileFormDefaultValues = {
  mtuType: MtuTypeEnum.AUTO,
  ageTimeMinutes: DEFAULT_AGE_TIME_MIN,
  ageTimeUnit: AgeTimeUnit.MINUTES
}

export const getTunnelProfileFormDefaultValues
  = (profileData?: TunnelProfile): TunnelProfileFormType => {
    const ageTime = profileData?.ageTimeMinutes || DEFAULT_AGE_TIME_MIN
    const result = ageTimeUnitConversion(ageTime)
    return {
      ...tunnelProfileFormDefaultValues,
      ...profileData,
      ageTimeMinutes: result?.value!,
      ageTimeUnit: result?.unit!
    } as TunnelProfileFormType
  }