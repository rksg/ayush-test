import { IntlShape } from 'react-intl'

import { getTenantId } from '@acx-ui/utils'

import { AgeTimeUnit, MtuRequestTimeoutUnit, MtuTypeEnum, NetworkSegmentTypeEnum } from '../../models'
import { TunnelProfile, TunnelProfileFormType, TunnelProfileViewData }             from '../../types/policies/tunnelProfile'

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
  targetType?: NetworkSegmentTypeEnum): { label: string, value: string }[] => {
  if (!profiles) return []

  const tenantId = getTenantId()
  const tunnelOpts = profiles.map(item => ({
    label: item.name, value: item.id
  }))
  const vxLanProfile = tunnelOpts.findIndex(item => item.value === tenantId)
  const vLanVxLanProfile = tunnelOpts.findIndex(item => item.value === `SL${tenantId}`)
  const vxlanDefault = getVxlanDefaultTunnelProfileOpt()
  const vlanVxLanDefault = getVlanVxlanDefaultTunnelProfileOpt()

  if (vxLanProfile === -1 && (!targetType || targetType === NetworkSegmentTypeEnum.VXLAN))
    tunnelOpts.push(vxlanDefault)

  if (vLanVxLanProfile === -1 && (!targetType || targetType === NetworkSegmentTypeEnum.VLAN_VXLAN))
    tunnelOpts.push(vlanVxLanDefault)

  return tunnelOpts
}

export const getNetworkSegmentTypeString = ($t: IntlShape['$t'], type: NetworkSegmentTypeEnum,
  isEdgeVxLanKaReady?: boolean) => {
  switch (type) {
    case NetworkSegmentTypeEnum.VXLAN:
      return isEdgeVxLanKaReady ? $t({ defaultMessage: 'VNI' }) : $t({ defaultMessage: 'VxLAN' })
    case NetworkSegmentTypeEnum.VLAN_VXLAN:
      return isEdgeVxLanKaReady ? $t({ defaultMessage: 'VLAN to VNI map' })
        : $t({ defaultMessage: 'VLAN-VxLAN' })

    default:
      return ''
  }
}

export const getNetworkSegmentTypeOptions = ($t: IntlShape['$t'])
: Array<{ label: string, value: NetworkSegmentTypeEnum }> => {
  return Object.keys(NetworkSegmentTypeEnum)
    .map(key => ({
      label: getNetworkSegmentTypeString($t, key as NetworkSegmentTypeEnum),
      value: key as NetworkSegmentTypeEnum
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

export const mtuRequestTimeoutUnitConversion = (mtuRequestTimeout?: number):
{ value: number, unit: MtuRequestTimeoutUnit } | undefined => {
  if(!mtuRequestTimeout) return undefined

  if (mtuRequestTimeout % 1000 === 0) {
    return {
      value: mtuRequestTimeout / 1000,
      unit: MtuRequestTimeoutUnit.SECONDS
    }
  } else {
    return {
      value: mtuRequestTimeout,
      unit: MtuRequestTimeoutUnit.MILLISECONDS
    }
  }
}

const DEFAULT_AGE_TIME_MIN = 20
const DEFAULT_KEEP_ALIVE_INTERVAL = 2
const DEFAULT_MTU_REQUEST_TIMEOUT = 2000
const DEFAULT_RETRY = 5
export const tunnelProfileFormDefaultValues = {
  mtuType: MtuTypeEnum.AUTO,
  ageTimeMinutes: DEFAULT_AGE_TIME_MIN,
  ageTimeUnit: AgeTimeUnit.MINUTES,
  mtuRequestTimeout: DEFAULT_MTU_REQUEST_TIMEOUT,
  mtuRequestTimeoutUnit: MtuRequestTimeoutUnit.MILLISECONDS,
  mtuRequestRetry: DEFAULT_RETRY,
  keepAliveInterval: DEFAULT_KEEP_ALIVE_INTERVAL,
  keepAliveRetry: DEFAULT_RETRY,
  natTraversalEnabled: false
}

export const getTunnelProfileFormDefaultValues
  = (profileData?: TunnelProfile): TunnelProfileFormType => {
    const ageTime = profileData?.ageTimeMinutes || DEFAULT_AGE_TIME_MIN
    const result = ageTimeUnitConversion(ageTime)
    const mtuRequestTime = profileData?.mtuRequestTimeout || DEFAULT_MTU_REQUEST_TIMEOUT
    const mtuRequestTimeResult = mtuRequestTimeoutUnitConversion(mtuRequestTime)
    return {
      ...tunnelProfileFormDefaultValues,
      ...profileData,
      ageTimeMinutes: result?.value!,
      ageTimeUnit: result?.unit!,
      mtuRequestTimeout: mtuRequestTimeResult?.value!,
      mtuRequestTimeoutUnit: mtuRequestTimeResult?.unit!
    } as TunnelProfileFormType
  }