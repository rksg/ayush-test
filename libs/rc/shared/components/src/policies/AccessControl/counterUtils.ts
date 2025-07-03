import { Features, useIsSplitOn }                                                                                                                                                                                                                                     from '@acx-ui/feature-toggle'
import { useAccessControlsCountQuery, useGetEnhancedAccessControlProfileListQuery, useGetEnhancedApplicationProfileListQuery, useGetEnhancedDeviceProfileListQuery, useGetEnhancedL2AclProfileListQuery, useGetEnhancedL3AclProfileListQuery, useGetLayer2AclsQuery } from '@acx-ui/rc/services'
import { TotalCountQueryResult }                                                                                                                                                                                                                                      from '@acx-ui/rc/utils'
import { getUserProfile, isCoreTier }                                                                                                                                                                                                                                 from '@acx-ui/user'

const defaultPayload = { fields: ['id'] }

export function useAclTotalCount (isDisabled?: boolean): TotalCountQueryResult {
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

  const { data: aclData, isFetching: aclIsFetching } = useWifiAclTotalCount(isDisabled)

  const { data: switchMacAclData, isFetching: switchMacAclIsFetching } = useSwitchAclTotalCount(
    isDisabled || !isSwitchMacAclEnabled
  )

  const aclTotalCount = Number(aclData?.totalCount ?? 0)
  const switchMacAclTotalCount = Number(switchMacAclData?.totalCount ?? 0)

  return {
    data: { totalCount: aclTotalCount + switchMacAclTotalCount },
    isFetching: aclIsFetching || switchMacAclIsFetching
  }
}

export function useWifiAclTotalCount (isDisabled?: boolean): TotalCountQueryResult & {
  aclCount: number,
  l2AclCount: number,
  l3AclCount: number,
  deviceAclCount: number,
  appAclCount: number
} {
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const requestArgs = {
    params: {},
    payload: { ...defaultPayload, noDetails: true },
    enableRbac
  }
  const requestOptions = {
    skip: isDisabled,
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 300
  }

  // eslint-disable-next-line max-len
  const { data: aclData, isFetching: aclIsFetching } = useGetEnhancedAccessControlProfileListQuery(requestArgs, requestOptions)
  // eslint-disable-next-line max-len
  const { data: l2AclData, isFetching: l2AclIsFetching } = useGetEnhancedL2AclProfileListQuery(requestArgs, requestOptions)
  // eslint-disable-next-line max-len
  const { data: l3AclData, isFetching: l3AclIsFetching } = useGetEnhancedL3AclProfileListQuery(requestArgs, requestOptions)
  // eslint-disable-next-line max-len
  const { data: deviceAclData, isFetching: deviceAclIsFetching } = useGetEnhancedDeviceProfileListQuery(requestArgs, requestOptions)
  // eslint-disable-next-line max-len
  const { data: appAclData, isFetching: appAclIsFetching } = useGetEnhancedApplicationProfileListQuery(requestArgs, {
    ...requestOptions,
    skip: isCore || isDisabled
  })

  const aclTotalCount = Number(aclData?.totalCount ?? 0)
  const l2AclTotalCount = Number(l2AclData?.totalCount ?? 0)
  const l3AclTotalCount = Number(l3AclData?.totalCount ?? 0)
  const deviceAclTotalCount = Number(deviceAclData?.totalCount ?? 0)
  const appAclTotalCount = Number(appAclData?.totalCount ?? 0)

  return {
    // eslint-disable-next-line max-len
    data: { totalCount: aclTotalCount + l2AclTotalCount + l3AclTotalCount + deviceAclTotalCount + appAclTotalCount },
    // eslint-disable-next-line max-len
    isFetching: aclIsFetching || l2AclIsFetching || l3AclIsFetching || deviceAclIsFetching || appAclIsFetching,
    aclCount: aclTotalCount,
    l2AclCount: l2AclTotalCount,
    l3AclCount: l3AclTotalCount,
    deviceAclCount: deviceAclTotalCount,
    appAclCount: appAclTotalCount
  }
}

export function useSwitchAclTotalCount (isDisabled?: boolean): TotalCountQueryResult & {
  switchMacAclCount: number,
  switchL2AclCount: number
} {
  const requestOptions = {
    skip: isDisabled,
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 300
  }

  // eslint-disable-next-line max-len
  const { data: switchMacAclData, isFetching: switchMacAclIsFetching } = useAccessControlsCountQuery(
    { params: {} },
    requestOptions
  )
  const { data: switchL2AclData, isFetching: switchL2AclIsFetching } = useGetLayer2AclsQuery(
    { params: {}, payload: { ...defaultPayload } },
    requestOptions
  )

  const switchMacAclTotalCount = Number(switchMacAclData ?? 0)
  const switchL2AclTotalCount = Number(switchL2AclData?.totalCount ?? 0)

  return {
    data: { totalCount: switchMacAclTotalCount + switchL2AclTotalCount },
    isFetching: switchMacAclIsFetching || switchL2AclIsFetching,
    switchMacAclCount: switchMacAclTotalCount,
    switchL2AclCount: switchL2AclTotalCount
  }
}