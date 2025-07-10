import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetEnhancedMdnsProxyListQuery, useGetEdgeMdnsProxyViewDataListQuery,
  useGetDHCPProfileListViewModelQuery,
  useGetDhcpStatsQuery
} from '@acx-ui/rc/services'
import { TotalCountQueryResult } from '@acx-ui/rc/utils'

const defaultPayload = { fields: ['id'] }

export function useMdnsProxyConsolidationTotalCount (
  isDisabled?: boolean
): TotalCountQueryResult<{
  mdnsProxyCount: number,
  edgeMdnsProxyCount: number
}> {
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const defaultQueryArgs = { params: {}, payload: defaultPayload, enableRbac }
  const requestOptions = {
    skip: isDisabled,
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 300
  }

  const { data: mdnsProxyData, isFetching: mdnsProxyFetching } =
    useGetEnhancedMdnsProxyListQuery(defaultQueryArgs, requestOptions)

  const { data: edgeMdnsProxyData, isFetching: edgeMdnsProxyIsFetching } =
    useGetEdgeMdnsProxyViewDataListQuery(defaultQueryArgs, requestOptions)

  const mdnsProxyCount = Number(mdnsProxyData?.totalCount ?? 0)
  const edgeMdnsProxyCount = Number(edgeMdnsProxyData?.totalCount ?? 0)

  return {
    data: {
      totalCount: mdnsProxyCount + edgeMdnsProxyCount,
      mdnsProxyCount,
      edgeMdnsProxyCount
    },
    isFetching: mdnsProxyFetching || edgeMdnsProxyIsFetching
  }
}

export function useDhcpConsolidationTotalCount (
  isDisabled?: boolean
) : TotalCountQueryResult<{
  dhcpCount: number,
  edgeDhcpCount: number
}> {
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const defaultQueryArgs = { params: {}, payload: defaultPayload, enableRbac }
  const requestOptions = {
    skip: isDisabled,
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 300
  }

  const { data: dhcpData, isFetching: dhcpIsFetching } =
    useGetDHCPProfileListViewModelQuery(defaultQueryArgs, requestOptions)

  const { data: edgeDhcpData, isFetching: edgeDhcpIsFetching } =
    useGetDhcpStatsQuery(defaultQueryArgs, requestOptions)

  const dhcpCount = Number(dhcpData?.totalCount ?? 0)
  const edgeDhcpCount = Number(edgeDhcpData?.totalCount ?? 0)

  return {
    data: {
      totalCount: dhcpCount + edgeDhcpCount,
      dhcpCount,
      edgeDhcpCount
    },
    isFetching: dhcpIsFetching || edgeDhcpIsFetching
  }
}
