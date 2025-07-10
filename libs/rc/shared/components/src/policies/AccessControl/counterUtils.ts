import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useAccessControlsCountQuery, useGetEnhancedAccessControlProfileListQuery,
  useGetEnhancedApplicationProfileListQuery, useGetEnhancedDeviceProfileListQuery,
  useGetEnhancedL2AclProfileListQuery, useGetEnhancedL3AclProfileListQuery,
  useGetLayer2AclsQuery
} from '@acx-ui/rc/services'
import { TotalCountQueryResult }      from '@acx-ui/rc/utils'
import { getUserProfile, isCoreTier } from '@acx-ui/user'

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

export function useWifiAclTotalCount (isDisabled?: boolean): TotalCountQueryResult<{
  aclCount: number,
  l2AclCount: number,
  l3AclCount: number,
  deviceAclCount: number,
  appAclCount: number
}> {
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

  const aclCount = Number(aclData?.totalCount ?? 0)
  const l2AclCount = Number(l2AclData?.totalCount ?? 0)
  const l3AclCount = Number(l3AclData?.totalCount ?? 0)
  const deviceAclCount = Number(deviceAclData?.totalCount ?? 0)
  const appAclCount = Number(appAclData?.totalCount ?? 0)

  return {
    data: {
      totalCount: aclCount + l2AclCount + l3AclCount + deviceAclCount + appAclCount,
      aclCount,
      l2AclCount,
      l3AclCount,
      deviceAclCount,
      appAclCount
    },
    // eslint-disable-next-line max-len
    isFetching: aclIsFetching || l2AclIsFetching || l3AclIsFetching || deviceAclIsFetching || appAclIsFetching
  }
}

export function useSwitchAclTotalCount (isDisabled?: boolean): TotalCountQueryResult<{
  switchMacAclCount: number,
  switchL2AclCount: number
}> {
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

  const switchMacAclCount = Number(switchMacAclData ?? 0)
  const switchL2AclCount = Number(switchL2AclData?.totalCount ?? 0)

  return {
    data: {
      totalCount: switchMacAclCount + switchL2AclCount,
      switchMacAclCount,
      switchL2AclCount
    },
    isFetching: switchMacAclIsFetching || switchL2AclIsFetching
  }
}
