import { AAARbacViewModalType, AAAViewModalType, ApiVersionEnum, GetApiVersionHeader, Radius, TableResult } from '@acx-ui/rc/utils'
import { RequestPayload }                                                                                   from '@acx-ui/types'
import { ApiInfo, createHttpRequest }                                                                       from '@acx-ui/utils'

// eslint-disable-next-line max-len
export function convertRbacDataToAAAViewModelPolicyList (input: TableResult<AAARbacViewModalType>): TableResult<AAAViewModalType> {
  const resolvedData = input.data.map(aaaRbacPolicy => {
    const { wifiNetworkIds, ...rest } = aaaRbacPolicy
    return { ...rest, networkIds: wifiNetworkIds }
  })
  return {
    ...input,
    data: resolvedData
  }
}

export function covertAAAViewModalTypeToRadius (data: AAAViewModalType): Radius {
  const { id, name, primary, secondary = '', type } = data
  const splitPrimary = primary.split(':')
  const splitSecondary = secondary.split(':')

  return {
    id,
    name,
    type,
    primary: {
      ip: splitPrimary[0],
      port: Number(splitPrimary[1])
    },
    ...(splitSecondary.length > 1 ? {
      ip: splitSecondary[0],
      port: Number(splitSecondary[1])
    } : {})
  }
}

interface CreateFetchArgsBasedOnRbacProps {
  apiInfo: ApiInfo
  rbacApiInfo?: ApiInfo
  rbacApiVersionKey?: ApiVersionEnum
  queryArgs: RequestPayload
}
export function createFetchArgsBasedOnRbac (props: CreateFetchArgsBasedOnRbacProps) {
  const { apiInfo, rbacApiInfo = apiInfo, rbacApiVersionKey, queryArgs } = props
  const enableRbac = queryArgs.enableRbac ?? false
  const resolvedApiInfo = enableRbac ? rbacApiInfo : apiInfo
  const apiVersionHeaders = GetApiVersionHeader(enableRbac ? rbacApiVersionKey : undefined)
  const resolvedPayload = enableRbac ? JSON.stringify(queryArgs.payload) : queryArgs.payload

  return {
    ...createHttpRequest(resolvedApiInfo, queryArgs.params, apiVersionHeaders),
    body: resolvedPayload
  }
}
